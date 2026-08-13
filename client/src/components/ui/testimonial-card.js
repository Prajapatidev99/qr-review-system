"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const Testimonial = React.forwardRef(
  ({ name, role, company, testimonial, rating = 5, image, selected = false, interactiveRole, className, ...props }, ref) => (
    <div
      ref={ref}
      role={interactiveRole}
      className={cn("testimonial-card", selected && "testimonial-card-selected", className)}
      {...props}
    >
      <div className="testimonial-card-quote" aria-hidden="true">&ldquo;</div>

      <div className="testimonial-card-content">
        {rating > 0 && (
          <div className="testimonial-card-stars" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={16}
                className={index < rating ? "testimonial-card-star-filled" : "testimonial-card-star-empty"}
              />
            ))}
          </div>
        )}

        <p className="testimonial-card-text">{testimonial}</p>

        {(name || role || image) && (
          <div className="testimonial-card-author">
            <div className="testimonial-card-author-inner">
              <Avatar className="testimonial-card-avatar">
                {image && <AvatarImage src={image} alt={name || "User"} height={48} width={48} />}
                <AvatarFallback>{name ? name[0].toUpperCase() : "U"}</AvatarFallback>
              </Avatar>
              <div className="testimonial-card-person">
                {name && <h3>{name}</h3>}
                {(role || company) && <p>{role}{company && ` · ${company}`}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
);

Testimonial.displayName = "Testimonial";

export { Testimonial };
