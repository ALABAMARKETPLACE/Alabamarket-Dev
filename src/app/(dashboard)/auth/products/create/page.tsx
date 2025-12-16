"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { notification, Steps } from "antd";
import ProductDetails from "./_components/details_form";
import ProductImages from "./_components/images";
import ProductVariant from "./_components/variants";
import ProductReview from "./_components/review";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { COMPRESS_IMAGE, POST, VIDEO_UPLOAD } from "@/util/apicall";
import { useRouter } from "next/navigation";
import API from "@/config/API";

function CreateProduct() {
  const [current, setCurrent] = useState(0);
  const [details, setDetails] = useState<Record<string, any>>({});
  const [coverImage, setCoverImage] = useState<any>(null);
  const [images, setImages] = useState<any[]>([{ id: Date.now(), file: null }]);
  const [product_video, setProduct_video] = useState<any>(null);
  const [variants, setVariants] = useState<any>([]);
  const [variantform, setVariantform] = useState([]);
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const router = useRouter();

  const uploadCoverImage = async () => {
    try {
      if (!coverImage.file) {
        Notifications["error"]({
          message: `No Cover image has been selected`,
          description: "",
        });
        throw new Error("No Cover image found..");
      }
      let upload = await COMPRESS_IMAGE(coverImage.file);
      const img = { ...coverImage };
      img["url"] = upload;
      setCoverImage(img);
      return img;
    } catch (err) {
      throw new Error("Failed to Upload Cover image..");
    }
  };

  const uploadImageFiles = async () => {
    try {
      let arr = [...images];
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr?.length; i++) {
          if (arr[i]?.file?.file) {
            let upload = await COMPRESS_IMAGE(arr[i]?.file?.file);
            let obj = arr[i];
            obj.url = upload;
            arr[i] = obj;
          }
        }
      }

      return arr;
    } catch (err) {
      console.log("err = = = ", err);
    }
  };

  const uploadVariantsImage = async () => {
    try {
      let arr = variants?.variants;
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i]?.image?.file) {
            let upload = await COMPRESS_IMAGE(arr[i]?.image?.file);
            let obj: any = arr[i];
            obj.image.url = upload;
            arr[i] = obj;
          }
        }
      }
      return arr;
    } catch (err) {
      console.log("err = = = ", err);
    }
  };

  const uploadProductVideo = async () => {
    try {
      if (product_video) {
        const upload = await VIDEO_UPLOAD(product_video);
        return upload;
      }
      return null;
    } catch (err) {
      console.log("Video upload error:", err);
      throw err;
    }
  };

  const mutationCreate = useMutation({
    mutationFn: async () => {
      const coverImage = await uploadCoverImage();
      const info: Record<string, any> = {
        ...details,
        category: Number(details?.category),
        subCategory: Number(details?.subCategory),
      };
      if (!coverImage?.url) {
        Notifications["error"]({
          message: "No Images Are selected..",
          description: "please choose atleast one image",
        });
        return;
      }
      info.image = images[0]?.url; //first image
      const imagess = await uploadImageFiles();
      const variants = await uploadVariantsImage();
      const videoUpload = await uploadProductVideo();

      const obj = {
        information: info,
        images: imagess,
        variants: variants,
        coverImage,
        product_video: videoUpload?.url || null,
      };
      return await POST(API.PRODUCTS_CREATE, obj);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Product Added Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_products"] });
      router.replace("/auth/products");
    },
  });

  return (
    <>
      {contextHolder}
      <PageHeader
        title={"Add Product"}
        bredcume={"Dashboard / Products / Create"}
      ></PageHeader>
      <Steps
        current={current}
        size="small"
        items={[
          {
            title: "Details",
            description: "Add Product Details",
          },
          {
            title: "Images",
            description: "Add Product Images",
          },
          {
            title: "Variants",
            description: "Add Variants",
          },
          {
            title: "Review and Submit",
            description: "Verify and finish",
          },
        ]}
      />
      <br />
      {current == 0 ? (
        <ProductDetails
          onFinish={(data: Record<string, string | number>) => {
            setDetails(data);
            setCurrent((c) => c + 1);
          }}
          formData={details}
        />
      ) : current == 1 ? (
        <ProductImages
          back={() => setCurrent((c) => c - 1)}
          onFinish={(cover: any, images: any[], video: any) => {
            setCoverImage(cover);
            setImages(images);
            setProduct_video(video);
            setCurrent((c) => c + 1);
          }}
          cover={coverImage}
          moreImg={images}
          product_video={product_video}
        />
      ) : current == 2 ? (
        <ProductVariant
          data={variants}
          variantform={variantform}
          variantformChange={(value: any) => setVariantform(value)}
          skip={() => setCurrent((c) => c + 1)}
          saveData={(value: any) => setVariants(value)}
          onBack={(value: any) => setCurrent((c) => c - 1)}
          onChange={(value: any) => {
            setVariants(() => value);
            setCurrent((c) => c + 1);
          }}
        />
      ) : current == 3 ? (
        <ProductReview
          details={details}
          coverImage={coverImage}
          images={images}
          variants={variants}
          back={() => setCurrent((c) => c - 1)}
          onFinish={() => mutationCreate.mutate()}
          loading={mutationCreate.isPending}
        />
      ) : null}
    </>
  );
}

export default CreateProduct;
