import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as HotToaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { LiveConcierge } from "./components/LiveConcierge";
import { AdminProtectedRoute } from "./admin/components/AdminProtectedRoute";
import { AdminLayout } from "./admin/components/AdminLayout";
import { PartnerProtectedRoute } from "./partner/components/PartnerProtectedRoute";
import { PartnerLayout } from "./partner/components/PartnerLayout";
import { ScrollToTop } from "./components/ScrollToTop";

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
const NotFound = lazy(() => import("./pages/NotFound"));
const SplashGateway = lazy(() =>
  import("./components/SplashGateway").then((m) => ({
    default: m.SplashGateway,
  })),
);
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));

// Admin Portal Pages
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
const AdminPropertyViewingsList = lazy(() =>
  import("./admin/pages/AdminPropertyViewingsList").then((m) => ({
    default: m.AdminPropertyViewingsList,
  })),
);
const AdminSiteVisits = lazy(() =>
  import("./admin/pages/AdminSiteVisits").then((m) => ({
    default: m.AdminSiteVisits,
  })),
);
const AdminChannelPartners = lazy(() =>
  import("./admin/pages/AdminChannelPartners").then((m) => ({
    default: m.AdminChannelPartners,
  })),
);
const AdminFranchisesList = lazy(() =>
  import("./admin/pages/AdminFranchisesList").then((m) => ({
    default: m.AdminFranchisesList,
  })),
);
const AdminFranchiseForm = lazy(() =>
  import("./admin/pages/AdminFranchiseForm").then((m) => ({
    default: m.AdminFranchiseForm,
  })),
);
const AdminFranchiseDetail = lazy(() =>
  import("./admin/pages/AdminFranchiseDetail").then((m) => ({
    default: m.AdminFranchiseDetail,
  })),
);
const AdminFranchisePage = lazy(() =>
  import("./admin/pages/AdminFranchisePage").then((m) => ({
    default: m.AdminFranchisePage,
  })),
);
const AdminHeroHighlights = lazy(() =>
  import("./admin/pages/AdminHeroHighlights").then((m) => ({
    default: m.AdminHeroHighlights,
  })),
);

// Channel Partner Portal Pages
const PartnerLogin = lazy(() =>
  import("./partner/pages/PartnerLogin").then((m) => ({
    default: m.PartnerLogin,
  })),
);
const PartnerRegister = lazy(() =>
  import("./partner/pages/PartnerRegister").then((m) => ({
    default: m.PartnerRegister,
  })),
);
const PartnerDashboard = lazy(() =>
  import("./partner/pages/PartnerDashboard").then((m) => ({
    default: m.PartnerDashboard,
  })),
);
const PartnerInventory = lazy(() =>
  import("./partner/pages/PartnerInventory").then((m) => ({
    default: m.PartnerInventory,
  })),
);
const PartnerSiteVisits = lazy(() =>
  import("./partner/pages/PartnerSiteVisits").then((m) => ({
    default: m.PartnerSiteVisits,
  })),
);
const PartnerLeads = lazy(() =>
  import("./partner/pages/PartnerLeads").then((m) => ({
    default: m.PartnerLeads,
  })),
);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
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
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/disclaimer" element={<Disclaimer />} />


              {/* Dedicated Partner Portal Routes */}
              <Route path="/partner/login" element={<PartnerLogin />} />
              <Route path="/partner/register" element={<PartnerRegister />} />
              <Route
                path="/partner"
                element={<Navigate to="/partner/dashboard" replace />}
              />
              <Route
                path="/partner/*"
                element={
                  <PartnerProtectedRoute>
                    <PartnerLayout />
                  </PartnerProtectedRoute>
                }
              >
                <Route path="dashboard" element={<PartnerDashboard />} />
                <Route path="inventory" element={<PartnerInventory />} />
                <Route path="site-visits" element={<PartnerSiteVisits />} />
                <Route path="leads" element={<PartnerLeads />} />
              </Route>

              {/* Super Admin Executive Portal Routes */}
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
                <Route path="franchises" element={<AdminFranchisesList />} />
                <Route path="franchises/new" element={<AdminFranchiseForm />} />
                <Route
                  path="franchises/:id/edit"
                  element={<AdminFranchiseForm />}
                />
                <Route path="franchises/:id" element={<AdminFranchiseDetail />} />
                <Route path="franchises/:id/page" element={<AdminFranchisePage />} />
                <Route
                  path="vault"
                  element={<Navigate to="/admin/channel-partners" replace />}
                />
                <Route path="viewing-records" element={<AdminPropertyViewingsList />} />
                <Route path="inquiries" element={<AdminInquiriesList />} />
                <Route path="site-visits" element={<AdminSiteVisits />} />
                <Route
                  path="channel-partners"
                  element={<AdminChannelPartners />}
                />
                <Route
                  path="hero-highlights"
                  element={<AdminHeroHighlights />}
                />
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
  </HelmetProvider>
);

export default App;
