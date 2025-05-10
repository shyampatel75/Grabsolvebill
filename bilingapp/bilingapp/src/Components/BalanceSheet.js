import React, { useState, useEffect } from "react";

const BalanceSheet = () => {
  const [invoices, setInvoices] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [companyInfo, setCompanyInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, depositsRes, companyRes] = await Promise.all([
          fetch("http://localhost:8000/api/invoices/"),
          fetch("http://localhost:8000/api/add-deposit/"),
          fetch("http://localhost:8000/api/banking/buyer/"),
        ]);

        if (!invoicesRes.ok || !depositsRes.ok || !companyRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const invoicesData = await invoicesRes.json();
        const depositsData = await depositsRes.json();
        const companyData = await companyRes.json();

        setInvoices(invoicesData);
        setDeposits(depositsData);
        setCompanyInfo(companyData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalInvoiceAmount = invoices.reduce(
    (sum, invoice) => sum + parseFloat(invoice.total_with_gst || 0),
    0
  );

  const totalDepositAmount = deposits.reduce(
    (sum, deposit) => sum + parseFloat(deposit.amount || 0),
    0
  );

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6" style={{ paddingLeft: "100px" }}>
      <h1 className="text-2xl font-bold mb-4">Balance Sheet</h1>

      <div className="d-flex justify-content-start">
        {/* Left Side: Deposits & Invoice Table */}
        <div className=" w-50 pr-4">
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
            <h2 className="text-lg font-semibold">Total Deposits:</h2>
            <p className="text-xl font-mono">
              ₹ {totalDepositAmount.toFixed(2)}
            </p>
          </div>
          

          {invoices.length > 0 ? (
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="w-50 bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border-b text-left">Invoice Date</th>
                    <th className="py-3 px-4 border-b text-left">Buyer Name</th>
                    <th className="py-3 px-4 border-b text-right">Total with GST</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 border-b">
                      <td className="py-3 px-4 border-b">
                        {invoice.invoice_date
                          ? new Date(invoice.invoice_date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 border-b">{invoice.buyer_name || "N/A"}</td>
                      <td className="py-3 px-4 border-b text-right font-mono">
                        {invoice.currency || ""}{" "}
                        {parseFloat(invoice.total_with_gst || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="py-3 px-4 border-t" colSpan="2">Total</td>
                    <td className="py-3 px-4 border-t text-right font-mono">
                      {invoices[0]?.currency || ""} {totalInvoiceAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              No invoices found.
            </div>
          )}
        </div>
        {/* Right Side: Buyer Transactions Info */}
        <div className="w-50 p-4 bg-gray-50 border border-gray-200 rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Buyer Transactions</h2>
          {companyInfo.length > 0 ? (
            <ul className="space-y-2">
              {companyInfo.map((buyer) => (
                <li key={buyer.id} className="bg-white p-3 rounded border">
                  <p><strong>Buyer Name:</strong> {buyer.buyer_name}</p>
                  <p><strong>Transaction Date:</strong> {buyer.transaction_date ? new Date(buyer.transaction_date).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Deposit Amount:</strong> ₹ {parseFloat(buyer.deposit_amount || 0).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No buyer transactions available.</p>
          )}
        </div>


      </div>
    </div>
  );
};

export default BalanceSheet;
