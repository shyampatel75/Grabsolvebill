from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Invoice, Setting
from .serializers import InvoiceSerializer, SettingSerializer
from django.contrib.auth.models import User
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# ========================
# 📦 Invoice APIs
# ========================

@api_view(['GET'])
def get_last_invoice_number(request):
    last_invoice = Invoice.objects.order_by('-id').first()
    if last_invoice:
        return Response({"invoice_number": last_invoice.invoice_number})
    else:
        return Response({"invoice_number": None})  

@csrf_exempt
def get_invoices_by_buyer(request):
    buyer_name = request.GET.get("name", "")
    invoices = Invoice.objects.filter(buyer_name__iexact=buyer_name)
    data = list(invoices.values())
    return JsonResponse(data, safe=False)

@api_view(['GET'])
def get_invoices(request):
    year_range = request.query_params.get('year', None)
    if year_range:
        invoices = Invoice.objects.filter(financial_year=year_range)
    else:
        invoices = Invoice.objects.all()

    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def create_invoice(request):
    print(request.data)
    serializer = InvoiceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def invoice_detail(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = InvoiceSerializer(invoice, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        invoice.delete()
        return Response({'message': 'Invoice deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# ✅ NEW - Class-based detail view for React use
class InvoiceDetailView(generics.RetrieveAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

# ========================
# ⚙️ Setting APIs
# ========================

@api_view(['GET', 'POST'])
def settings_list_create(request):
    if request.method == 'GET':
        settings = Setting.objects.all()
        serializer = SettingSerializer(settings, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        existing_setting = Setting.objects.first()
        if existing_setting:
            serializer = SettingSerializer(existing_setting, data=request.data)
        else:
            serializer = SettingSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK if existing_setting else status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_setting(request, pk):
    try:
        setting = Setting.objects.get(pk=pk)
    except Setting.DoesNotExist:
        return Response({'error': 'Setting not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = SettingSerializer(setting, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_setting(request, pk):
    try:
        setting = Setting.objects.get(pk=pk)
    except Setting.DoesNotExist:
        return Response({'error': 'Setting not found'}, status=status.HTTP_404_NOT_FOUND)

    setting.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ========================
# 👤 User Signup API
# ========================

@api_view(['POST'])
def signup_user(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.save()
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)



def generate_next_invoice_number():
    current_year = datetime.now().year
    next_year = current_year + 1
    financial_year = f"{current_year}-{next_year}"

    last_invoice = Invoice.objects.filter(financial_year=financial_year).order_by('-created_at').first()
    
    if last_invoice and last_invoice.invoice_number:
        # Assuming format is like "01-2025/2026"
        try:
            last_number = int(last_invoice.invoice_number.split('-')[0])
        except:
            last_number = 0
    else:
        last_number = 0

    new_number = last_number + 1
    return f"{new_number:02d}-{financial_year}"

