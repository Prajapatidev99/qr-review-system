"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

export interface TestimonialProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  role: string
  company?: string
  testimonial: string
  rating?: number
  image?: string
}

const Testimonial = React.forwardRef<HTMLDivElement, TestimonialProps>(
  ({ name, role, company, testimonial, rating = 5, image, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300 md:p-8",
          className
        )}
        {...props}
      >
        <div className="absolute right-6 top-6 text-6xl font-serif text-slate-200 pointer-events-none select-none">
          &ldquo;
        </div>

        <div className="flex flex-col gap-4 justify-between h-full relative z-10">
          {rating > 0 && (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={cn(
                    index < rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  )}
                />
              ))}
            </div>
          )}

          <p className="text-pretty text-base text-slate-600 leading-relaxed">
            {testimonial}
          </p>

          <div className="flex items-center gap-4 justify-start pt-2">
            <div className="flex items-center gap-4">
              {image ? (
                <Avatar>
                  <AvatarImage src={image} alt={name} height={48} width={48} />
                  <AvatarFallback>{name ? name[0] : 'U'}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarFallback>{name ? name[0] : 'U'}</AvatarFallback>
                </Avatar>
              )}

              <div className="flex flex-col">
                <h3 className="font-semibold text-slate-900 text-sm">{name}</h3>
                <p className="text-xs text-slate-500">
                  {role}
                  {company && ` @ ${company}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)
Testimonial.displayName = "Testimonial"

export { Testimonial }
