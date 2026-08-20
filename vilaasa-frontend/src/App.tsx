import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { LiveConcierge } from "./components/LiveConcierge";
import { SplashGateway } from "./components/SplashGateway";

// Public Pages
const Index = lazy(() => import("./pages/Index"));
const Domestic = lazy(() => import("./pages/Domestic"));
const DomesticRealEstate = lazy(() => import("./pages/DomesticRealEstate"));
const DomesticFranchise = lazy(() => import("./pages/DomesticFranchise"));
const International = lazy(() => import("./pages/International"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const FranchiseDetail = lazy(() => import("./pages/FranchiseDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Calendar = lazy(() => import("./pages/Calendar"));
const WealthProjector = lazy(() => import("./pages/WealthProjector"));
const VaultLogin = lazy(() => import("./pages/VaultLogin"));
const VaultDashboard = lazy(() => import("./pages/VaultDashboard"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Portal Components & Pages
const AdminLayout = lazy(() =>
  import("./admin/components/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const AdminProtectedRoute = lazy(() =>
  import("./admin/components/AdminProtectedRoute").then((m) => ({
    default: m.AdminProtectedRoute,
  })),
);
const AdminLogin = lazy(() =>
  import("./admin/pages/AdminLogin").then((m) => ({ default: m.AdminLogin })),
);
const AdminDashboard = lazy(() =>
  import("./admin/pages/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const AdminPropertiesList = lazy(() =>
  import("./admin/pages/AdminPropertiesList").then((m) => ({
    default: m.AdminPropertiesList,
  })),
);
const AdminPropertyForm = lazy(() =>
  import("./admin/pages/AdminPropertyForm").then((m) => ({
    default: m.AdminPropertyForm,
  })),
);
const AdminPropertyDetail = lazy(() =>
  import("./admin/pages/AdminPropertyDetail").then((m) => ({
    default: m.AdminPropertyDetail,
  })),
);
const AdminInquiriesList = lazy(() =>
  import("./admin/pages/AdminInquiriesList").then((m) => ({
    default: m.AdminInquiriesList,
  })),
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#181818",
              color: "#ffffff",
              border: "1px solid #2a2a2a",
              fontSize: "12px",
              borderRadius: "8px",
            },
          }}
        />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<SplashGateway />} />
              <Route path="/home" element={<Index />} />
              <Route path="/domestic" element={<Domestic />} />
              <Route
                path="/domestic/real-estate"
                element={<DomesticRealEstate />}
              />
              <Route path="/domestic/franchise" element={<DomesticFranchise />} />
              <Route path="/international" element={<International />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/franchise/:id" element={<FranchiseDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/wealth-projector" element={<WealthProjector />} />
              <Route path="/vault" element={<VaultLogin />} />
              <Route path="/vault/dashboard" element={<VaultDashboard />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/disclaimer" element={<Disclaimer />} />

              {/* Admin Portal Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route
                path="/admin/*"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="properties" element={<AdminPropertiesList />} />
                <Route path="properties/new" element={<AdminPropertyForm />} />
                <Route
                  path="properties/:id/edit"
                  element={<AdminPropertyForm />}
                />
                <Route path="properties/:id" element={<AdminPropertyDetail />} />
                <Route path="inquiries" element={<AdminInquiriesList />} />
              </Route>

              {/* Catch-All 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <LiveConcierge />
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;
