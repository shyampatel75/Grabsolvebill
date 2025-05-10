// EditInvoice.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditInvoice = () => {
    const { id } = useParams(); // Invoice ID from URL
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`http://localhost:8000/api/invoices/${id}/`);
                const data = await res.json();
                setInvoice(data);
            } catch (err) {
                console.error("Error fetching invoice:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoice();
    }, [id]);

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`http://localhost:8000/api/update/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(invoice),
            });

            if (res.ok) {
                alert("Invoice updated successfully");
                navigate("/client-invoices"); // Redirect back to invoice list
            } else {
                alert("Failed to update invoice.");
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!invoice) return <div>Loading...</div>;

    return (
        <div style={{ paddingLeft: "100px" }}>
            <h3>Edit Invoice #{invoice.invoice_number}</h3>

            <div className="mb-3">
                <label className="form-label">Buyer Name:</label>
                <input
                    className="form-control"
                    value={invoice.buyer_name}
                    onChange={(e) =>
                        setInvoice({ ...invoice, buyer_name: e.target.value })
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Invoice Date:</label>
                <input
                    type="date"
                    className="form-control"
                    value={invoice.invoice_date}
                    onChange={(e) =>
                        setInvoice({ ...invoice, invoice_date: e.target.value })
                    }
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Total With GST:</label>
                <input
                    type="number"
                    className="form-control"
                    value={invoice.total_with_gst}
                    onChange={(e) =>
                        setInvoice({ ...invoice, total_with_gst: e.target.value })
                    }
                />
            </div>


            <div className="table-bordered black-bordered main-box" style={{ backgroundColor: "white" }}>
                <div className="row date-tables">
                    <div className="col-6">
                        {/* Seller Info */}
                        {/* <table className="table table-bordered black-bordered" >
                <tbody>
                  <tr >
                    <td className="gray-background" >
                      <strong style={{ fontSize: "15px", fontfamily: "Arial, sans-serif" }}>
                        Grabsolve Infotech:
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px", fontFamily: "Arial, sans-serif" }}>
                      {data.seller_address}
                      <br />
                      Email: {data.seller_email}
                      <br />
                      PAN: {data.seller_pan}
                      <br />
                    </td>
                  </tr>
                  <tr>
                    <td className="gray-background">
                      <strong style={{ fontSize: "15px", fontfamily: "Arial, sans-serif" }}>  GSTIN/UIN:</strong> {data.seller_gstin}
                    </td>
                  </tr>
                </tbody>
              </table> */}

                        {/* Buyer Info */}
                        <table className="table table-bordered black-bordered">
                            <tbody>
                                <tr>
                                    <td className="gray-background">
                                        <strong style={{ fontSize: "15px", fontfamily: "Arial, sans-serif" }}>Buyer (Bill to):</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Name:{" "}
                                        <input
                                            type="text"
                                            name="buyer_name"
                                            className="billToTitle"
                                            value={invoice.buyer_name}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice, buyer_name: e.target.value })
                                            }
                                        />
                                        <br />
                                        Address:
                                        <textarea
                                            type="text"
                                            name="buyer_address"
                                            className="billToAddress"
                                            style={{ width: "100%", height: "100px" }}
                                            value={invoice.buyer_address}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice, buyer_address: e.target.value })
                                            }
                                        />
                                        <br />
                                        GSTIN/UIN:{" "}
                                        <input
                                            type="text"
                                            name="buyer_gst"
                                            className="billToGST"
                                            value={invoice.buyer_gst}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice, buyer_gst: e.target.value })
                                            }
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Consignee Info */}

                        <table className="table table-bordered black-bordered">
                            <tbody>
                                <tr>
                                    <td className="gray-background">
                                        <strong style={{ fontSize: "15px", fontfamily: "Arial, sans-serif" }}>Consignee (Ship to):</strong>

                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Name:{" "}
                                        <input
                                            type="text"
                                            name="consignee_name"
                                            className="shipToTitle"
                                            value={invoice.consignee_name}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice, consignee_name: e.target.value })
                                            }
                                        />
                                        <br />
                                        Address:
                                        <textarea
                                            name="consignee_address"
                                            className="shipToAddress"
                                            style={{ width: "100%", height: "100px" }}
                                            value={invoice.consignee_address}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice, consignee_address: e.target.value })
                                            }
                                        />
                                        <br />
                                        GSTIN/UIN:{" "}
                                        <input
                                            type="text"
                                            name="consignee_gst"
                                            className="shipToGST"
                                            value={invoice.consignee_gst}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice, consignee_gst: e.target.value })
                                            }
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="col-6">
                        <table className="table table-bordered black-bordered">
                            <tbody>
                                <tr>
                                    <td style={{ width: "50%" }}>Invoice No.</td>
                                    <td className="invoice-no-td">

                                        <input
                                            type="text"
                                            style={{ width: "75%", margin: "1px 5px 1px 5px" }}
                                            name="invoice_number"
                                            className="invoice_Number"
                                            value={invoice.invoice_number}
                                            readOnly
                                            onChange={(e) =>
                                                setInvoice({ ...invoice, invoice_number: e.target.value })
                                            }
                                        />

                                    </td>
                                </tr>
                                <tr>
                                    <td>Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            id="datePicker"
                                            value={invoice.invoice_date}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice, invoice_date: e.target.value })
                                            }
                                            name="invoice_date"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Delivery Note</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="deliveryNote"
                                            value={invoice.delivery_note}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice,delivery_note: e.target.value })
                                            }
                                            name="delivery_note"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Mode/Terms of Payment</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="deliveryNote"
                                            value={invoice.payment_mode}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice,payment_mode: e.target.value })
                                            }
                                            name="payment_mode"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Delivery Note Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            id="datePicker"
                                            value={invoice.delivery_note_date}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice,delivery_note_date: e.target.value })
                                            }
                                            name="invoice_date"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Destination</td>
                                    <td>
                                        <input
                                            type="text"
                                            name="destination"
                                            className="deliveryNote"
                                            value={invoice.destination}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice,destination: e.target.value })
                                            }
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table className="table table-bordered black-bordered">
                            <tbody>
                                <tr>
                                    <td className="gray-background">
                                        <strong style={{ fontSize: "15px", fontfamily: "Arial, sans-serif" }}>Terms to Delivery:</strong>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <textarea
                                            className="billToAddress"
                                            name="Terms_to_delivery"
                                            style={{ width: "100%", height: "100px" }}
                                            value={invoice.Terms_to_delivery}
                                            onChange={(e) =>
                                                setInvoice({ ...invoice,Terms_to_delivery: e.target.value })
                                            }
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>










                        <button
                            className="btn btn-success me-2"
                            onClick={handleUpdate}
                            disabled={isLoading}
                        >
                            {isLoading ? "Updating..." : "Update"}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("/client-invoices")}
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditInvoice;
