import { Clock, ShieldCheck, Leaf, Package } from "lucide-react"

const benefits = [
  {
    icon: Leaf,
    title: "100% Vegetarian",
    description: "Completely vegetarian and made with carefully selected ingredients.",
  },
  {
    icon: Clock,
    title: "Ready in Minutes",
    description: "Quick to prepare: ready-to-eat meals and instant mixes made for busy days.",
  },
  {
    icon: Package,
    title: "Homemade & Fresh",
    description: "Traditional, homemade recipes with no artificial colors or flavors.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Assured",
    description: "FSSAI certified with rigorous quality checks at every stage of production.",
  },
]

export function BenefitsSection() {
  return (
    <section className="py-16 lg:py-24 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Why Choose EasyKitchen?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            We combine traditional recipes with modern food technology to bring you the best of both worlds.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="relative bg-card rounded-lg p-6 text-center border border-border hover:border-primary/30 transition-colors"
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground">{benefit.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

