import React, { useEffect } from "react";
import styles from "./sideMenu.module.scss";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { reduxCategoryItems } from "../../redux/slice/categorySlice";

const SideMenu = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const categories = useSelector(reduxCategoryItems);
  const router = useRouter();
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <div className={open ? styles.sideMenuOpen : styles.sideMenuClosed}>
        <div className={styles.sideMenuHeader}>
          <span>Hello, sign in</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.menuContent}>
          <div className={styles.menuAuthLinks}>
            <div
              className={styles.menuItem}
              onClick={() => {
                onClose();
                router.push("/login");
              }}
            >
              Sign In
            </div>
            <div
              className={styles.menuItem}
              onClick={() => {
                onClose();
                router.push("/signup");
              }}
            >
              Sign Up
            </div>
          </div>
          {categories && categories.length > 0 ? (
            categories.map((cat: any) => (
              <div key={cat._id} className={styles.menuSection}>
                <div className={styles.menuTitle}>{cat.name}</div>
                {cat.sub_categories && cat.sub_categories.length > 0 && (
                  <div className={styles.subMenuList}>
                    {cat.sub_categories.map((sub: any) => (
                      <div
                        key={sub._id}
                        className={styles.menuItem}
                        onClick={() => {
                          onClose();
                          router.push(
                            `/category/${sub.slug}?id=${window.btoa(
                              sub._id
                            )}&type=${encodeURIComponent(sub.name)}`
                          );
                        }}
                      >
                        {sub.name}
                        <span className={styles.arrow}>&#8250;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.menuItem}>No categories found</div>
          )}
        </div>
      </div>
    </>
  );
};

export default SideMenu;
