import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    content: "As a working professional, EasyKitchen has been a game-changer. The homemade taste and quick prep make weekday meals effortless.",
    author: "Priya Sharma",
    role: "Software Engineer, Bangalore",
    rating: 5,
  },
  {
    content: "I was skeptical about ready-to-eat food, but the quality is incredible. The chutney and masala powders are so fresh.",
    author: "Rahul Verma",
    role: "Student, Delhi",
    rating: 5,
  },
  {
    content: "We order a few packs every week for our family. The instant mixes and ready-to-eat options save so much time.",
    author: "Meera Krishnan",
    role: "Working Mother, Chennai",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Join thousands of happy customers who trust EasyKitchen for their daily vegetarian products
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-card rounded-lg p-6 border border-border"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/10" />
              <div className="flex gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-medium text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

