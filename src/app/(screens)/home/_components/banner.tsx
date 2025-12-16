import React from "react";
import Slider from "react-slick";
import useWindowWidth from "../../../../shared/hook/useWindowWidth";
import { Container } from "react-bootstrap";
function Banners(props: any) {
  const Slidesettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 6000,
    speed: 3000,
    slidesToShow: 1,
    fade: true,
    slidesToScroll: 1,
  };

  const isSmaller = useWindowWidth(762);
  return (
    <div className="HomeScreen-BannerBox mt-3">
      <Container fluid className="home-full-width">
        {props?.data?.length ? (
          <Slider {...Slidesettings}>
            {props.data.map((bann: any) => {
              return (
                <div key={bann.id}>
                  <div
                    key={bann.id}
                    className="HomeScreen-Banners"
                    style={{
                      backgroundImage: `url(${
                        isSmaller
                          ? bann.img_mob || bann.img_desk
                          : bann.img_desk
                      })`,
                    }}
                  >
                    <div className="HomeScreen-BannersBox">
                      <div className="HomeScreen-Bannertxt2">{bann.title}</div>
                      <div className="HomeScreen-Bannertxt3">
                        {bann.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        ) : null}
      </Container>
    </div>
  );
}
export default Banners;
