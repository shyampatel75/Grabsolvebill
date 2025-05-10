import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Clientinvoices = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const printRef = useRef();

  const client = state?.client;

  useEffect(() => {
    if (!client) {
      fetchInvoices();
    }
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/api/invoices/");
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (invoice) => {
    try {
      setIsLoading(true);

      // Fetch settings data
      const resSetting = await fetch(`http://localhost:8000/api/settings/`);
      const settingsData = await resSetting.json();
      const settings = settingsData[0];

      let fullInvoice;

      if (invoice.id && invoice.invoice_number) {
        fullInvoice = { ...invoice, ...settings };
      } else {
        const res = await fetch(`http://localhost:8000/api/invoices/${invoice}/`);
        const pdfBasicDetail = await res.json();
        fullInvoice = { ...pdfBasicDetail, ...settings };
      }

      // Preload logo if present
      if (fullInvoice.logo) {
        const logoImg = new Image();
        logoImg.crossOrigin = "Anonymous";
        logoImg.src = fullInvoice.logo;

        logoImg.onload = () => {
          setSelectedInvoice(fullInvoice);
          setLogoLoaded(true);
        };

        logoImg.onerror = () => {
          console.warn("Logo failed to load, generating PDF without logo.");
          setSelectedInvoice(fullInvoice);
          setLogoLoaded(true); // Still continue without logo
        };
      } else {
        setSelectedInvoice(fullInvoice);
        setLogoLoaded(true);
      }
    } catch (err) {
      console.error("Download error:", err);
      setIsLoading(false);
    }
  };


  const generatePDF = async () => {
    const input = printRef.current;
    if (input) {
      try {
        const canvas = await html2canvas(input, {
          useCORS: true,
          allowTaint: true,
          scale: 2,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 10; // in mm
        const availableWidth = pageWidth - 2 * margin;
        const availableHeight = pageHeight - 2 * margin;

        // Calculate scaled image size maintaining aspect ratio
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;

        let finalWidth = availableWidth;
        let finalHeight = finalWidth / ratio;

        if (finalHeight > availableHeight) {
          finalHeight = availableHeight;
          finalWidth = finalHeight * ratio;
        }

        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
        pdf.save(`Invoice_${selectedInvoice.invoice_number}.pdf`);
      } catch (err) {
        console.error("PDF generation error:", err);
      } finally {
        setSelectedInvoice(null);
        setLogoLoaded(false);
        setIsLoading(false);
      }
    }
  };


  useEffect(() => {
    if (selectedInvoice && logoLoaded) {
      generatePDF();
    }
  }, [selectedInvoice, logoLoaded]);

  const displayInvoices = client ? client.invoices : invoices;


  const handleDelete = async (invoiceId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this invoice?");
    if (!confirmDelete) return;

    try {
      setIsLoading(true);

      const response = await fetch(`http://127.0.0.1:8000/api/delete/${invoiceId}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove invoice from state
        setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));

        // If viewing by client
        if (client) {
          client.invoices = client.invoices.filter(inv => inv.id !== invoiceId);
        }

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

  const handleEdit = (invoice) => {
    setEditingInvoice({ ...invoice }); // Open the edit form
  };




  return (
    <div style={{ padding: "40px" }}>
      {client ? (
        <h2>
          Invoices for {client.buyer_name} (GST: {client.buyer_gst})
        </h2>
      ) : (
        <h2>All Invoices</h2>
      )}

      <table className="table table-bordered table-hover text-center mt-3">
        <thead className="table-dark">
          <tr>
            <th>Sr. No.</th>
            <th>Buyer Name</th>
            <th>Bill Number</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>items</th>



          </tr>
        </thead>
        <tbody>
          {displayInvoices.map((invoice, index) => (
            <tr key={invoice.id} className="items">
              <td>{index + 1}</td>
              <td>{invoice.buyer_name}</td>
              <td>{invoice.invoice_number}</td>
              <td>{invoice.invoice_date}</td>
              <td>
                {invoice.currency} {parseFloat(invoice.total_with_gst).toFixed(2)}
              </td>
              <td>
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                      navigate(`/invoice-detail/${invoice.id}`, { state: { invoice } })
                    }
                  >
                    View
                  </button>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => handleDownload(invoice)}
                    disabled={isLoading}
                  >
                    {isLoading && selectedInvoice?.id === invoice.id
                      ? "Generating..."
                      : "Download"}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(invoice.id)}
                    disabled={isLoading}
                  >
                    {isLoading && selectedInvoice?.id === invoice.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => navigate(`/edit-invoice/${invoice.id}`)}
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

      </table>







      {/* Hidden Printable Section */}
      {selectedInvoice && (
        <div ref={printRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
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
                    <table className="table table-bordered black-bordered" style={{ textAlign: "center" }}>
                      <thead>
                        <tr className="trbody" >
                          <th style={{ backgroundColor: "#f1f3f4" }}>SI No.</th>
                          <th style={{ backgroundColor: "#f1f3f4" }}>Particulars</th>
                          <th style={{ backgroundColor: "#f1f3f4" }}>HSN/SAC</th>
                          <th style={{ backgroundColor: "#f1f3f4" }}>Hours</th>
                          <th style={{ backgroundColor: "#f1f3f4" }}>Rate</th>
                          <th style={{ backgroundColor: "#f1f3f4" }}>Amount</th>
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
                            <th style={{ backgroundColor: "#f1f3f4" }} rowSpan="2">HSN/SAC</th>
                            <th style={{ backgroundColor: "#f1f3f4" }} rowSpan="2">Taxable Value</th>
                            <th style={{ backgroundColor: "#f1f3f4" }} colSpan="2">Central Tax</th>
                            <th style={{ backgroundColor: "#f1f3f4" }} colSpan="2">State Tax</th>
                            <th style={{ backgroundColor: "#f1f3f4" }} colSpan="2" rowSpan="2">
                              Total Tax Amount
                            </th>
                          </tr>
                          <tr>
                            <th style={{ backgroundColor: "#f1f3f4" }}>Rate</th>
                            <th style={{ backgroundColor: "#f1f3f4" }}>Amount</th>
                            <th style={{ backgroundColor: "#f1f3f4" }}>Rate</th>
                            <th style={{ backgroundColor: "#f1f3f4" }}>Amount</th>
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
                        src={`http://127.0.0.1:8000${selectedInvoice.logo}`}
                        alt="Company Logo"
                        onLoad={() => setLogoLoaded(true)} // Track loading
                        className="logo-image"
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

export default Clientinvoices;
