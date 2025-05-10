import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Address = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const printRef = useRef();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    fetch("http://localhost:8000/api/invoices/")
      .then((res) => res.json())
      .then((data) => setInvoices(data))
      .catch((err) => console.error("Error fetching invoices:", err));
  };

  const handleDelete = async (invoiceId) => {
    


    try {
      setIsLoading(true);

      const response = await fetch(`http://127.0.0.1:8000/api/delete/${invoiceId}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove invoice from state
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));

        // If viewing by client
        

        alert("Invoice deleted successfully.");
      } else {
        alert("Failed to delete invoice.");
      }
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert("Something went wrong while deleting.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (invoiceId) => {
    navigate(`/edit-invoice/${invoiceId}`);
  };

  const handleDownload = async (invoiceId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/invoices/${invoiceId}/`);
      const pdfBasicDetail = await res.json();

      const resSetting = await fetch(`http://localhost:8000/api/settings/`);
      const pdfMainDetails = await resSetting.json();

      setSelectedInvoice({
        ...pdfBasicDetail,
        ...pdfMainDetails[0]
      });

      const logoImg = new Image();
      logoImg.crossOrigin = "Anonymous";
      logoImg.src = 'http://127.0.0.1:8000/media/favicon_cvGw7pn.png';
      logoImg.onload = () => setLogoLoaded(true);

    } catch (err) {
      console.error("Download error:", err);
    }
  };

  useEffect(() => {
    if (selectedInvoice && logoLoaded) {
      const timer = setTimeout(() => {
        generatePDF();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedInvoice, logoLoaded]);

  const generatePDF = async () => {
    const input = printRef.current;
  
    if (input) {
      try {
        const canvas = await html2canvas(input, {
          useCORS: true,
          allowTaint: false,
          scale: 2,
          logging: false,
        });
  
        const imgData = canvas.toDataURL("image/png");
  
        const pdf = new jsPDF("p", "mm", "a4");
  
        const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
        const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
        const margin = 10; // 10mm on all sides
  
        const availableWidth = pageWidth - 2 * margin;
        const availableHeight = pageHeight - 2 * margin;
  
        const imgWidth = availableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
        const x = margin;
        const y = margin + (availableHeight - imgHeight) / 2;
  
        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        pdf.save(`Invoice_${selectedInvoice?.invoice_number || 'Draft'}.pdf`);
      } catch (err) {
        console.error("PDF generation error:", err);
      } finally {
        setSelectedInvoice(null);
        setLogoLoaded(false);
      }
    }
  };
  

  const handleNewBill = (invoice) => {
    navigate('/tax-invoice', {
      state: {
        buyerData: {
          buyer_name: invoice?.buyer_name || '',
          buyer_address: invoice?.buyer_address || '',
          buyer_gst: invoice?.buyer_gst || '',
        },
        consigneeData: {
          consignee_name: invoice?.consignee_name || '',
          consignee_address: invoice?.consignee_address || '',
          consignee_gst: invoice?.consignee_gst || '',
        }
      }
    });
  };

  return (
    <div className="containers" style={{ height: "100vh" }}>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end pt-2 pb-2 px-4">
        <button
          type="button"
          className="naw-biladd"
          onClick={() => navigate("/tax-invoice")}
        >
          <i className="bi bi-plus-lg"></i> New Bills
        </button>
      </div>

      <div style={{ padding: "10px 21px 10px 82px" }}>
        <div style={{ borderRadius: "32px", overflow: "hidden", border: "15px solid" }}>
          <table className="table table-striped table-hover text-center">
            <thead className="table-dark">
              <tr>
                <th>No.</th>
                <th>Buyer Name</th>
                <th>Buyer Address</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={invoice.id}>
                  <td>{index + 1}</td>
                  <td>{invoice.buyer_name}</td>
                  <td
                    className="truncate address-hover"
                    title={invoice.buyer_address}
                    onClick={() => {
                      navigator.clipboard.writeText(invoice.buyer_address);
                      alert("Address copied to clipboard!");
                    }}
                  >
                    {invoice.buyer_address.length > 20
                      ? invoice.buyer_address.slice(0, 20) + "..."
                      : invoice.buyer_address}
                  </td>
                  <td>
                    {invoice.currency} {parseFloat(invoice.total_with_gst).toFixed(2)}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/invoice-detail/${invoice.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-info btn-sm text-white"
                        onClick={() => handleEdit(invoice.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(invoice.id)}
                        disabled={isDeleting === invoice.id}
                      >
                        {isDeleting === invoice.id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleDownload(invoice.id)}
                      >
                        Download
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleNewBill(invoice)}
                      >
                        New Bill
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Hidden printable invoice for PDF */}
      {selectedInvoice && (
        <div ref={printRef} style={{ position: "absolute", left: "-9999px" }}>
          <div style={{ paddingLeft: "10px" }}>
            <div style={{ paddingRight: "10px" }}>
              <h2 className="text-center">TAX INVOICE</h2>
              <div className="table-bordered black-bordered main-box" style={{ backgroundColor: "white" }}>
                <div className="row date-tables">
                  <div className="col-6">
                    {/* Seller Info */}
                    <table className="table table-bordered black-bordered">
                      <tbody style={{ border: "2px solid" }}>
                        <tr>
                          <td className="gray-background">
                            <strong style={{ fontSize: "15px" }}>
                              Grabsolve Infotech:
                            </strong>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            {selectedInvoice.seller_address}
                            <br />
                            Email: {selectedInvoice.seller_email}
                            <br />
                            PAN: {selectedInvoice.seller_pan}
                            <br />
                          </td>
                        </tr>
                        <tr>
                          <td className="gray-background">
                            <strong>GSTIN/UIN:</strong> {selectedInvoice.seller_gstin}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Buyer Info */}
                    <table className="table table-bordered black-bordered">
                      <tbody style={{ border: "2px solid" }}>
                        <tr>
                          <td className="gray-background">
                            <strong>Buyer (Bill to):</strong> {selectedInvoice.buyer_name}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              maxWidth: "250px",
                              overflowWrap: "break-word",
                              height: "150px",
                            }}
                          >
                            {selectedInvoice.buyer_address}
                          </td>
                        </tr>
                        <tr>
                          <td className="gray-background">
                            <strong>GSTIN/UIN:</strong> {selectedInvoice.buyer_gst}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Consignee Info */}
                    <table className="table table-bordered black-bordered">
                      <tbody style={{ border: "2px solid" }}>
                        <tr>
                          <td className="gray-background">
                            <strong>Consignee (Ship to):</strong> {selectedInvoice.consignee_name}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              maxWidth: "250px",
                              overflowWrap: "break-word",
                              height: "150px",
                            }}
                          >
                            {selectedInvoice.consignee_address}
                          </td>
                        </tr>
                        <tr>
                          <td className="gray-background">
                            <strong>GSTIN/UIN:</strong> {selectedInvoice.consignee_gst}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-6">
                    <table className="table table-bordered black-bordered">
                      <tbody style={{ border: "2px solid" }}>
                        <tr>
                          <td style={{ width: "50%" }}>Invoice No.</td>
                          <td>
                            {selectedInvoice.invoice_number}
                          </td>
                        </tr>
                        <tr>
                          <td>Date</td>
                          <td>{selectedInvoice.invoice_date}</td>
                        </tr>
                        <tr>
                          <td>Delivery Note</td>
                          <td>{selectedInvoice.delivery_note}</td>
                        </tr>
                        <tr>
                          <td>Mode/Terms of Payment</td>
                          <td>{selectedInvoice.payment_mode}</td>
                        </tr>
                        <tr>
                          <td>Delivery Note Date</td>
                          <td>{selectedInvoice.delivery_note_date}</td>
                        </tr>
                        <tr>
                          <td>Destination</td>
                          <td>{selectedInvoice.destination}</td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="table table-bordered black-bordered">
                      <tbody style={{ width: "100%", border: "2px solid" }}>
                        <tr>
                          <td className="gray-background">
                            <strong>Terms to Delivery:</strong>
                          </td>
                        </tr>
                        <tr>
                          <td style={{
                            maxWidth: "250px",
                            overflowWrap: "break-word",
                            height: "150px",
                          }}>{selectedInvoice.Terms_to_delivery}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="relative w-72">
                      <p>
                        <strong>Country and currency:</strong>
                      </p>
                      <div
                        className="border border-gray-300 p-2 rounded flex items-center justify-between cursor-pointer bg-white">
                        <div
                          className="flex items-center"
                          style={{ height: "30px" }}
                        >
                          <span className="mr-2">
                            {selectedInvoice.country} {selectedInvoice.currency}
                          </span>
                        </div>
                      </div>
                    </div>

                    <input type="hidden" id="currencyTitle" value="INR" />
                    <input type="hidden" id="currencySymbol" value="₹" />
                  </div>
                </div>

                <div className="row">
                  <div className="col-xs-12">
                    <table className="table table-bordered black-bordered">
                      <thead>
                        <tr className="trbody" style={{ border: "2px solid" }}>
                          <th>SI No.</th>
                          <th>Particulars</th>
                          <th>HSN/SAC</th>
                          <th>Hours</th>
                          <th>Rate</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody style={{ border: "2px solid" }}>
                        <tr style={{ height: "111px" }}>
                          <td>1</td>
                          <td>{selectedInvoice.Particulars}</td>
                          <td style={{ width: "130px" }}>{selectedInvoice.hsn_code}</td>
                          <td style={{ width: "10%" }}>{selectedInvoice.total_hours}</td>
                          <td style={{ width: "10%" }}>{selectedInvoice.rate}</td>
                          <td style={{ width: "200px" }}>
                            <span className="currency-sym">
                              {selectedInvoice.currency} {selectedInvoice.base_amount}
                            </span>
                          </td>
                        </tr>
                        {selectedInvoice.country === "India" && (
                          <>
                            <tr className="inside-india">
                              <td></td>
                              <td>
                                <span style={{ float: "right" }}>CGST @ 9%</span>
                              </td>
                              <td></td>
                              <td></td>
                              <td>9%</td>
                              <td id="cgst">
                                <span className="currency-sym">{selectedInvoice.currency} {selectedInvoice.cgst}</span>
                              </td>
                            </tr>
                            <tr className="inside-india">
                              <td></td>
                              <td>
                                <span style={{ float: "right" }}>SGST @ 9%</span>
                              </td>
                              <td></td>
                              <td></td>
                              <td>9%</td>
                              <td id="sgst">
                                <span className="currency-sym">{selectedInvoice.currency} {selectedInvoice.sgst}</span>
                              </td>
                            </tr>
                          </>
                        )}
                        <tr>
                          <td colSpan="5" className="text-right">
                            <strong>Total</strong>
                          </td>
                          <td>
                            <strong id="total-with-gst">
                              {selectedInvoice.currency} {selectedInvoice.total_with_gst}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xs-12">
                    <div className="table-bordered black-bordered amount-box">
                      <div>
                        <p>
                          <strong>Amount Chargeable (in words):</strong>
                        </p>
                        <h4 className="total-in-words">
                          <span className="currency-text">INR</span>
                        </h4>
                        <div className="top-right-corner">
                          <span>E. & O.E</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  {selectedInvoice.country === "India" && (
                    <div className="col-xs-12 inside-india">
                      <table className="table table-bordered invoice-table">
                        <thead style={{ border: "2px solid" }}>
                          <tr>
                            <th rowSpan="2">HSN/SAC</th>
                            <th rowSpan="2">Taxable Value</th>
                            <th colSpan="2">Central Tax</th>
                            <th colSpan="2">State Tax</th>
                            <th colSpan="2" rowSpan="2">
                              Total Tax Amount
                            </th>
                          </tr>
                          <tr>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th>Rate</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody style={{ border: "2px solid" }}>
                          <tr>
                            <td>
                              <span className="hns_select_text">{selectedInvoice.hsn_code}</span>
                            </td>
                            <td className="taxable-value">
                              {selectedInvoice.base_amount}
                            </td>
                            <td>9%</td>
                            <td className="tax-cgst">{selectedInvoice.cgst}</td>
                            <td>9%</td>
                            <td className="tax-sgst">{selectedInvoice.sgst}</td>
                            <td className="all-tax-amount">{selectedInvoice.taxtotal}</td>
                          </tr>
                          <tr className="total-row">
                            <td>Total</td>
                            <td className="total-taxable">
                              {selectedInvoice.base_amount}
                            </td>
                            <td></td>
                            <td className="total-tax-cgst">{selectedInvoice.cgst}</td>
                            <td></td>
                            <td className="total-tax-sgst">{selectedInvoice.sgst}</td>
                            <td className="total-tax-amount">
                              {selectedInvoice.taxtotal}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{ padding: "0 0 0 20px" }}>
                    <div className="col-xs-12 inside-india">
                      <div>
                        <strong>Tax Amount (in words):</strong>
                        <span className="total-tax-in-words">
                          <span className="currency-text">INR</span>
                        </span>
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div>
                        <h4>
                          <strong>Remarks:</strong>
                        </h4>
                        <h5 className="html-remark">{selectedInvoice.remark}</h5>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-x-12">
                    <div className="hr">
                      <strong>Company's Bank Details</strong>
                      <br />
                      A/c Holder's Name: {selectedInvoice.seller_name}
                      <br />
                      Bank Name: {selectedInvoice.bank_name}
                      <br />
                      A/c No.: {selectedInvoice.account_number}
                      <br />
                      IFS Code: {selectedInvoice.ifsc_code}
                      <br />
                      Branch: {selectedInvoice.branch}
                      <br />
                      SWIFT Code: {selectedInvoice.swift_code}
                    </div>
                    <div className="text-right signatory">
                      <img
                        className="logo-image"
                        src='http://127.0.0.1:8000/media/favicon_cvGw7pn.png'
                        alt="Logo"
                        height={100}
                        crossOrigin="anonymous" // Add this attribute
                        onLoad={() => setLogoLoaded(true)} // Track loading
                      />
                      <p>for Grabsolve Infotech</p>
                      <p>Authorized Signatory</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center">This is a Computer Generated Invoice</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;

