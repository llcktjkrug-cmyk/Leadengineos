import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import RequestDeliverable from "@/pages/RequestDeliverable";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Cookie from "@/pages/Cookie";
import MedSpaEngine from "@/pages/MedSpaEngine";
import DentalImplantsEngine from "@/pages/DentalImplantsEngine";
import MultiLocationEngine from "@/pages/MultiLocationEngine";
import BlogAdmin from "@/pages/BlogAdmin";
import Audit from "@/pages/Audit";
import EmailTemplates from "@/pages/EmailTemplates";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import RobotsMetaTag from "./components/RobotsMetaTag";

// Public pages
import Home from "./pages/Home";
import Solutions from "./pages/Solutions";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Proof from "./pages/Proof";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

// App pages
import Dashboard from "./pages/Dashboard";
import DashboardRequests from "./pages/DashboardRequests";
import DashboardLibrary from "./pages/DashboardLibrary";
import DashboardQuota from "./pages/DashboardQuota";
import DashboardBilling from "./pages/DashboardBilling";
import DashboardSettings from "./pages/DashboardSettings";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      {/* Public Marketing Pages */}
      <Route path="/" component={Home} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/solutions/med-spa" component={MedSpaEngine} />
      <Route path="/solutions/dental-implants" component={DentalImplantsEngine} />
      <Route path="/solutions/multi-location" component={MultiLocationEngine} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/proof" component={Proof} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cookie" component={Cookie} />
      <Route path="/audit" component={Audit} />

      {/* App Pages */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/requests" component={DashboardRequests} />
      <Route path="/dashboard/library" component={DashboardLibrary} />
      <Route path="/dashboard/quota" component={DashboardQuota} />
      <Route path="/dashboard/billing" component={DashboardBilling} />
      <Route path="/dashboard/settings" component={DashboardSettings} />
      <Route path="/request" component={RequestDeliverable} />
        <Route path="/admin" component={Admin} />
      <Route path="/admin/blog" component={BlogAdmin} />
      <Route path="/admin/templates" component={EmailTemplates} />
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <RobotsMetaTag />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
