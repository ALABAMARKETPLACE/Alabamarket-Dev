// "use client";
// import React, { useState, useEffect } from "react";
// import { Image } from "antd";

// type Props = {
//   coverImage: string;
//   images: { url: string; type: string }[];
// };

// function ProductImages(props: Props) {
//   const [mainImage, setMainImage] = useState<string>("");

//   useEffect(() => {
//     if (props.coverImage) {
//       setMainImage(props.coverImage);
//     }
//   }, [props.coverImage]);

//   const thumbnails = props.coverImage
//     ? [{ url: props.coverImage, type: "main" }, ...props.images]
//     : [...props.images];
//   return (
//     <div>
//       <Image.PreviewGroup>
//         <Image
//           src={mainImage}
//           alt="Main Product Image"
//           style={{ width: "100%", marginBottom: "10px" }}
//         />

//         <div className="thumbnail_img"  style={{ display: "flex", gap: "10px" }}>
//           {thumbnails.map((item, index) => (
//             <img
//               key={index}
//               src={item.url}
//               alt={`Thumbnail ${index}`}
//               style={{
//                 width: 50,
//                 cursor: "pointer",
//                 border:
//                   item.url === mainImage
//                     ? "2px solid #1890ff"
//                     : "1px solid #ccc",
//                 borderRadius: "5px",
//               }}
//               onMouseOver={() => setMainImage(item.url)}
//             />
//           ))}
//         </div>
//       </Image.PreviewGroup>
//     </div>
//   );
// }

// export default ProductImages;
"use client";
import React, { useState, useEffect } from "react";
import { Image } from "antd";

type Props = {
  coverImage: string;
  images: { url: string; type: string }[];
  product_video?: string;
};

function ProductImages(props: Props) {
  const [mainImage, setMainImage] = useState<string>("");
  const [showVideo, setShowVideo] = useState<boolean>(false);

  useEffect(() => {
    if (props.coverImage) {
      setMainImage(props.coverImage);
    }
  }, [props.coverImage]);

  const thumbnails = props.coverImage
    ? [{ url: props.coverImage, type: "main" }, ...(props.images || [])]
    : [...(props.images || [])];

  // Add video thumbnail if video exists
  if (props.product_video) {
    thumbnails.push({ url: props.product_video, type: "video" });
  }

  const handleThumbnailClick = (item: any) => {
    if (item.type === "video") {
      setShowVideo(true);
    } else {
      setShowVideo(false);
      setMainImage(item.url);
    }
  };

  return (
    <div>
      <Image.PreviewGroup>
        {showVideo && props.product_video ? (
          <div style={{ width: "100%", marginBottom: "10px" }}>
            <video
              controls
              style={{ width: "100%", maxHeight: "400px" }}
              poster={props.coverImage} // Use cover image as poster
            >
              <source src={props.product_video} type="video/mp4" />
              <source src={props.product_video} type="video/webm" />
              <source src={props.product_video} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
            <div style={{ 
              textAlign: "center", 
              marginTop: "8px", 
              fontSize: "12px", 
              color: "#666" 
            }}>
              Product Video
            </div>
          </div>
        ) : (
          <Image
            src={mainImage || props.coverImage}
            alt="Main Product Image"
            style={{ width: "100%", marginBottom: "10px" }}
          />
        )}

        <div className="thumbnail_img" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {thumbnails.map((item, index) => (
            <div
              key={index}
              style={{
                position: "relative",
                cursor: "pointer",
                border: 
                  (item.type === "video" && showVideo) || 
                  (item.type !== "video" && item.url === mainImage)
                    ? "2px solid #1890ff" 
                    : "1px solid #ccc",
                borderRadius: "5px",
                overflow: "hidden",
              }}
              onClick={() => handleThumbnailClick(item)}
            >
              {item.type === "video" ? (
                <div style={{ 
                  width: 50, 
                  height: 50, 
                  background: "linear-gradient(45deg, #1890ff, #40a9ff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "20px"
                }}>
                  ▶️
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Thumbnail ${index}`}
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </Image.PreviewGroup>
    </div>
  );
}

export default ProductImages;
