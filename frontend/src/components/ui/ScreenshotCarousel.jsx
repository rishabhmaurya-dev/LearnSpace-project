import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const ScreenshotCarousel = () => {
  const screenshots = [
    "/screenshots/dashboard.png",
    "/screenshots/enrollledCourses.png",
    "/screenshots/courses.png",
    "/screenshots/certificates.png",
    "/screenshots/profile.png",
    "/screenshots/ai.png",
  ];

  return (
    <section className="ls-screenshot-slider">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        spaceBetween={0}
        loop={true}
        speed={1000}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
      >
        {screenshots.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="ls-screenshot-card">
              <img src={image} alt={`Screenshot ${index + 1}`} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ScreenshotCarousel;
