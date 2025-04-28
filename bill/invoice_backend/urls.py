from django.urls import path
from . import views
from .views import InvoiceDetailView

urlpatterns = [
    path('invoices/', views.get_invoices, name='invoice-list'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('create/', views.create_invoice, name='create-invoice'),
    path('update/<int:pk>/', views.invoice_detail, name='update-invoice'),
    path('delete/<int:pk>/', views.invoice_detail, name='delete-invoice'),
    path("invoices/by-buyer/", views.get_invoices_by_buyer),
    path('last-invoice/', views.get_last_invoice_number),
    path('settings/', views.settings_list_create, name='settings-list-create'),
    path('settings/<int:pk>/', views.update_setting, name='update-setting'),
    path('settings/<int:pk>/delete/', views.delete_setting, name='delete-setting'),
    path('signup/', views.signup_user, name='signup'),
    # path('invoices/last-invoice-number/', views.get_last_invoice_number, name='last-invoice-number'),
    path('invoices/next-invoice-number/', views.generate_next_invoice_number, name='next-invoice-number'),       
]
