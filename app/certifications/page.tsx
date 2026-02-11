import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import {
  Shield,
  Award,
  FileCheck,
  Microscope,
  ClipboardCheck,
  BadgeCheck,
  CheckCircle,
} from "lucide-react"

const certifications = [
  {
    icon: Shield,
    title: "FSSAI License",
    license: "Lic. No: 10012345678901",
    description: "Food Safety and Standards Authority of India certification ensuring all our products meet national food safety standards.",
    features: [
      "Regular facility inspections",
      "Compliance with hygiene standards",
      "Proper labeling requirements",
      "Traceability of ingredients",
    ],
  },
  {
    icon: Award,
    title: "ISO 22000:2018",
    license: "Certificate No: ISO-22000-2024-001",
    description: "International standard for food safety management systems, ensuring systematic approach to food safety.",
    features: [
      "Hazard analysis and critical control points",
      "Prerequisite programs",
      "Management system requirements",
      "Continuous improvement",
    ],
  },
  {
    icon: FileCheck,
    title: "HACCP Certified",
    license: "HACCP-2024-FB-001",
    description: "Hazard Analysis Critical Control Point certification for systematic preventive approach to food safety.",
    features: [
      "Hazard identification",
      "Critical control points monitoring",
      "Corrective action procedures",
      "Verification and documentation",
    ],
  },
]

const qualityProcess = [
  {
    step: 1,
    title: "Ingredient Sourcing",
    description: "All ingredients are sourced from certified suppliers with strict quality checks on arrival.",
  },
  {
    step: 2,
    title: "Testing & Inspection",
    description: "Raw materials undergo microbiological and chemical testing before entering production.",
  },
  {
    step: 3,
    title: "Controlled Production",
    description: "State-of-the-art facility with temperature control, hygiene protocols, and trained staff.",
  },
  {
    step: 4,
    title: "Quality Assurance",
    description: "Every batch is tested for taste, texture, and safety before packaging.",
  },
  {
    step: 5,
    title: "Safe Packaging",
    description: "Retort packaging technology ensures extended shelf life without preservatives.",
  },
  {
    step: 6,
    title: "Final Inspection",
    description: "Random sampling and inspection before dispatch to ensure consistent quality.",
  },
]

export default function CertificationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <BadgeCheck className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-primary">Quality Assured</span>
              </div>
              <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">
                Certifications & Quality
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                We maintain the highest standards of food safety and quality. 
                Our certifications are a testament to our commitment to delivering 
                safe, hygienic, and delicious vegetarian products.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                Our Certifications
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Industry-recognized certifications that validate our commitment to quality and safety
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {certifications.map((cert) => (
                <div
                  key={cert.title}
                  className="bg-card rounded-lg border border-border p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <cert.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{cert.title}</h3>
                  <p className="text-sm text-primary mt-1">{cert.license}</p>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                    {cert.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {cert.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                Our Quality Process
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                A rigorous 6-step quality assurance process ensures every product meets our high standards
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {qualityProcess.map((process) => (
                <div
                  key={process.step}
                  className="bg-card rounded-lg border border-border p-6"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {process.step}
                    </span>
                    <h3 className="font-semibold text-foreground">{process.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {process.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Microscope className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-primary">Lab Tested</span>
                </div>
                <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
                  Regular Testing & Analysis
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Every batch of our products undergoes comprehensive testing at NABL-accredited 
                  laboratories. We test for microbiological safety, nutritional content, and 
                  absence of contaminants.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Microbiological testing for pathogens",
                    "Heavy metal analysis",
                    "Pesticide residue testing",
                    "Nutritional value verification",
                    "Shelf life studies",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <ClipboardCheck className="h-5 w-5 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-primary/5 rounded-2xl p-8 lg:p-12">
                <div className="text-center">
                  <p className="text-6xl font-bold text-primary">100%</p>
                  <p className="text-lg text-foreground mt-2">Products Tested</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Before any product reaches you, it goes through our comprehensive 
                    quality testing process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
