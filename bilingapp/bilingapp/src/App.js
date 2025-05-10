import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import YearDetails from "./Components/YearDetails";
import Clients from "./Components/Clients";
import Dashboard from "./Components/Dashboard";
import Address from "./Components/Address.js";
import Billsfillers from "./Components/Billsillers";
import FilteredResults from "./Components/FilteredResults";
import TaxInvoice from "./Components/TaxInvoice";
import Setting from "./Components/Setting";
import Login from "./Components/loginpage";
import Signup from "./Components/signup";
import ViewInvoice from "./Components/ViewInvoice";
import InvoiceDetails from "./Components/InvoiceDetails";
import BillManager from "./Components/BillManager";
import ViewsDetailsInfo from "./Components/ViewsDetailsInfo";
import Billsyears from "./Components/YearTable";
// import Viewsbutton from "./Components/Viewsbutton";
import ViewsButton from "./Components/Viewsbutton";
import Banking from "./Components/Banking.js";
import BalanceSheet from "./Components/BalanceSheet.js";
import Profile from "./Components/Profile.js";
// import NewBillPage from "./Components/NewBillPage.js";
import ClientInvoices from "./Components/ClientInvoices.js";
import Buyer from "./Components/Buyer.js";
import EditInvoice from "./Components/EditInvoice.js";



// Wrapper to show/hide sidebar based on path
const AppContent = () => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // hide sidebar on login and signup
  const hideSidebar = location.pathname === "/" || location.pathname === "/si";

  return (
    <div>
      {!hideSidebar && isAuthenticated && <Sidebar />}
      <div className="flex-grow-1 w-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/si" element={<Signup />} />

          {/* Protected Routes (optional: add guards later) */}

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/year-table" element={<Billsyears />} />
          <Route path="/:yearRange" element={<YearDetails />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/address" element={<Address />} />
          <Route path="/view-invoice/:name" element={<ViewInvoice />} />
          <Route path="/billsfilter" element={<Billsfillers />} />
          <Route path="/filtered-results" element={<FilteredResults />} />
          <Route path="/tax-invoice" element={<TaxInvoice />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/invoice-details/:id" element={<InvoiceDetails />} />
          <Route path="/billmanager" element={<BillManager />} />
          <Route path="/bills/:buyer_name" element={<ViewsDetailsInfo />} />
          <Route path="/invoice-detail/:id" element={<ViewsButton />} />
          <Route path="/banking" element={<Banking/>} />
          <Route path="/balancesheet" element={<BalanceSheet/>} />
          <Route path="/profile" element={<Profile />} /> {/* Add this */}
          {/* <Route path="/tax-invoice/new" element={<NewBillPage />} /> */}
          <Route path="/client-invoices" element={<ClientInvoices />} />
          <Route path="/buyer" element={<Buyer />} />
          <Route path="/edit-invoice/:id" element={<EditInvoice />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
