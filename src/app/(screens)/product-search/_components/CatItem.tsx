import React from "react";
import { IoSearch } from "react-icons/io5";
const CatItem = (props: any) => {
  return (
    <div className="search-CatItem">
      <div>
        <IoSearch size={20} />
      </div>
      <div className="search-CatItem-text1">{props?.item?.name}</div>
    </div>
  );
};
export default CatItem;
