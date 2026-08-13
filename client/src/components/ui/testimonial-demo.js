import { Testimonial } from "./testimonial-card"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager",
    company: "Amazun",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=sarah",
    testimonial: "This library has completely transformed how we build our UI components. The attention to detail and smooth animations make our application stand out. Highly recommended!"
  },
  {
    name: "John Doe",
    role: "Software Engineer",
    company: "Goggle",
    rating: 4,
    image: "https://i.pravatar.cc/150?u=john",
    testimonial: "The components are well documented and easy to customize. The code quality is top-notch and the support is excellent. I'm very happy with my purchase."
  },
  {
    name: "Emily Chen",
    role: "UX Designer",
    company: "Microsift",
    rating: 5,
    image: "https://i.pravatar.cc/150?u=emily",
    testimonial: "The accessibility features and design system consistency are impressive. It's saved us countless hours in development time."
  }
]

export function TestimonialDemo() {
  return (
    <div className="container py-10">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Testimonial key={testimonial.name} {...testimonial} />
        ))}
      </div>
    </div>
  )
}
