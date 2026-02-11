import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import { FiTrendingUp, FiTrendingDown, FiArrowRight } from "react-icons/fi";

interface CardProps {
  link?: string;
  Title: string;
  icon: ReactNode;
  value: number | string;
  Desc?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "success" | "warning" | "danger" | "info";
}

function Cards({ 
  link, 
  Title, 
  icon, 
  value, 
  Desc, 
  trend, 
  trendValue,
  color = "primary" 
}: CardProps) {
  const router = useRouter();
  
  const getColorClass = () => {
    switch(color) {
      case "success": return "dashboard-stat-card--success";
      case "warning": return "dashboard-stat-card--warning";
      case "danger": return "dashboard-stat-card--danger";
      case "info": return "dashboard-stat-card--info";
      default: return "dashboard-stat-card--primary";
    }
  };

  return (
    <div
      className={`dashboard-stat-card ${getColorClass()} ${link ? 'dashboard-stat-card--clickable' : ''}`}
      onClick={() => {
        if (link) router.push(link);
      }}
    >
      <div className="dashboard-stat-card__header">
        <div className="dashboard-stat-card__icon-wrapper">
          {icon}
        </div>
        {trend && trendValue && (
          <div className={`dashboard-stat-card__trend dashboard-stat-card__trend--${trend}`}>
            {trend === "up" ? <FiTrendingUp /> : trend === "down" ? <FiTrendingDown /> : null}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="dashboard-stat-card__body">
        <span className="dashboard-stat-card__label">{Title}</span>
        <div className="dashboard-stat-card__value">{value?.toLocaleString?.() ?? value}</div>
        {Desc && <span className="dashboard-stat-card__desc">{Desc}</span>}
      </div>
      
      {link && (
        <div className="dashboard-stat-card__footer">
          <span>View details</span>
          <FiArrowRight />
        </div>
      )}
    </div>
  );
}

export default Cards;
