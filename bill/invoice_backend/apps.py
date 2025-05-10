from django.apps import AppConfig

class InvoiceBackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'invoice_backend'

    def ready(self):
        import invoice_backend.signals