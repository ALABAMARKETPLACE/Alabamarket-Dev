import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";

interface props {
  link?: string;
  Title: string;
  icon: ReactNode;
  value: number | string;
  Desc?: string;
}
function Cards({ link, Title, icon, value, Desc }: props) {
  const router = useRouter();
  return (
    <div
      className="DashboardAdmin-card"
      onClick={() => {
        if (link) router.push(link);
        return;
      }}
    >
      <div className="DashboardAdmin-card-header">
        <div className="DashboardAdmin-card-text1">{Title}</div>
        <div className="DashboardAdmin-card-icons">{icon}</div>
      </div>
      <div className="cards-content-wrapper">
        <div className="DashboardAdmin-card-text2">{value}</div>
        {Desc && <div className="DashboardAdmin-card-text3">{Desc}</div>}
      </div>
    </div>
  );
}

export default Cards;
