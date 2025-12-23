import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Mail, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vertical: "",
    notes: "",
    consentEmail: false,
    consentSms: false,
  });

  const createLead = trpc.leads.create.useMutation({
    onSuccess: () => {
      toast.success("Message sent! We'll be in touch within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        vertical: "",
        notes: "",
        consentEmail: false,
        consentSms: false,
      });
    },
    onError: (error) => {
      toast.error("Failed to send message. Please try again.");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    createLead.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      source: "contact_form",
      sourcePage: window.location.href,
      vertical: formData.vertical,
      notes: formData.notes,
      consentEmail: formData.consentEmail,
      consentSms: formData.consentSms,
    });
  };

  return (
    <div className="min-h-screen flex flex-col" data-surface="marketing">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="mb-6">Contact</h1>
            <p className="text-xl text-muted-foreground mb-4">
              For sales and onboarding inquiries, use the form below.
            </p>
            <p className="text-lg text-muted-foreground">
              If you are an active customer, submit requests through the portal for fastest handling.
              Typical response time: within 1 business day.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Dr. Jane Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vertical">Industry</Label>
                        <Input
                          id="vertical"
                          value={formData.vertical}
                          onChange={(e) => setFormData({ ...formData, vertical: e.target.value })}
                          placeholder="Med Spa, Dental, Multi-location"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Message</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Tell us about your practice and what you're looking for..."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="consentEmail"
                          checked={formData.consentEmail}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, consentEmail: checked as boolean })
                          }
                        />
                        <label htmlFor="consentEmail" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                          I consent to receive email communications from Lead Engine OS about my inquiry and related
                          services.
                        </label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="consentSms"
                          checked={formData.consentSms}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, consentSms: checked as boolean })
                          }
                        />
                        <label htmlFor="consentSms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                          I consent to receive SMS communications from Lead Engine OS (optional).
                        </label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gradient-primary"
                      disabled={createLead.isPending}
                    >
                      {createLead.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Email Us</CardTitle>
                  <CardDescription>For general inquiries and support</CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href="mailto:support@leadengine.kiasufamilytrust.org"
                    className="text-primary hover:underline"
                  >
                    support@leadengine.kiasufamilytrust.org
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                    <MessageSquare className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle>Response Time</CardTitle>
                  <CardDescription>We typically respond within</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">24 hours</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Monday - Friday, 9am - 6pm EST
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Prefer to Talk?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule a 15-minute call to discuss your needs and see if we're a good fit.
                  </p>
                  <Button variant="outline" className="w-full">
                    Schedule a Call
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
