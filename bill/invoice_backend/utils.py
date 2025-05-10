# from datetime import datetime
# from .models import Invoice

# # @api_view(['GET'])
# # @permission_classes([IsAuthenticated])
# def get_next_invoice_number():
#     current_year = datetime.now().year
#     next_year = current_year + 1
#     financial_year = f"{current_year}/{next_year}"

#     # Get all invoices for the current financial year
#     invoices = Invoice.objects.filter(financial_year=financial_year)

#     if invoices.exists():
#         # Extract numbers and find the maximum
#         numbers = []
#         for invoice in invoices:
#             try:
#                 num_part = invoice.invoice_number.split('-')[0]
#                 numbers.append(int(num_part))
#             except (ValueError, IndexError):
#                 continue
        
#         if numbers:
#             max_num = max(numbers)
#             next_num = max_num + 1
#         else:
#             next_num = 1
#     else:
#         next_num = 1
    
#     return f"{next_num:02d}-{financial_year}", financial_year
