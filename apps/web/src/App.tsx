import { Route, Routes, useLocation } from 'react-router-dom';
import { AscentaApp } from './components/ascenta/App';
import { Home } from './components/ascenta/home';
import { AuthPage } from './components/ascenta/auth';
import { BookingPage } from './components/ascenta/booking';
import { JourneysPage, ProfilePage } from './components/ascenta/portal';
import { OperationsPage } from './components/ascenta/operations';
import { BusinessPage, ContactPage, FleetPage, HelpPage, NotFoundPage, PolicyPage, ServicesPage } from './components/ascenta/pages';
import { NavigationEffects } from './routes/navigation-effects';

export function App() {
  const { pathname } = useLocation();
  return <AscentaApp><NavigationEffects /><Routes key={pathname}>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<ServicesPage />} />
    <Route path="/fleet" element={<FleetPage />} />
    <Route path="/business" element={<BusinessPage />} />
    <Route path="/booking" element={<BookingPage />} />
    <Route path="/login" element={<AuthPage />} />
    <Route path="/dashboard" element={<JourneysPage />} />
    <Route path="/account" element={<ProfilePage />} />
    <Route path="/corporate" element={<JourneysPage corporate />} />
    <Route path="/corporate/usage" element={<JourneysPage corporate />} />
    <Route path="/admin" element={<OperationsPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/help" element={<HelpPage />} />
    <Route path="/privacy" element={<PolicyPage privacy />} />
    <Route path="/terms" element={<PolicyPage privacy={false} />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></AscentaApp>;
}
