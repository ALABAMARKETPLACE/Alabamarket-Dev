import React, { useEffect, useState } from "react";
import styles from "./sideMenu.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { reduxCategoryItems } from "../../redux/slice/categorySlice";
import { useSession, signOut } from "next-auth/react";
import { clearReduxData } from "@/lib/clear_redux";
import {
  IoClose,
  IoPersonOutline,
  IoLogOutOutline,
  IoChevronForward,
  IoChevronDown,
  IoGridOutline,
  IoBagHandleOutline,
} from "react-icons/io5";
import { Avatar } from "antd";

const SideMenu = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const categories = useSelector(reduxCategoryItems);
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session }: any = useSession();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Reset expanded state when menu closes
  useEffect(() => {
    if (!open) {
      setExpandedCategories([]);
    }
  }, [open]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => (prev.includes(catId) ? [] : [catId]));
  };

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.sideMenu} ${open ? styles.open : ""}`}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            {session?.user ? (
              <>
                <Avatar
                  size={48}
                  src={session.user.image}
                  icon={<IoPersonOutline />}
                  className={styles.avatar}
                />
                <div className={styles.userDetails}>
                  <span className={styles.greeting}>Hello,</span>
                  <span className={styles.username}>
                    {session.user.first_name || session.user.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.avatarPlaceholder}>
                  <IoPersonOutline />
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.greeting}>Welcome,</span>
                  <span
                    className={styles.username}
                    onClick={() => handleNavigation("/login")}
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    Sign In / Register
                  </span>
                </div>
              </>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className={styles.content}>
          {/* Auth Actions (if not logged in) */}
          {!session?.user && (
            <div className={styles.authSection}>
              <button
                className={styles.authBtn}
                onClick={() => handleNavigation("/login")}
              >
                Sign In
              </button>
              <button
                className={`${styles.authBtn} ${styles.outline}`}
                onClick={() => handleNavigation("/signup")}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Quick Links */}
          {session?.user && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>My Account</div>
              <div
                className={styles.menuItem}
                onClick={() => handleNavigation("/user/profile")}
              >
                <IoPersonOutline className={styles.icon} />
                <span>Profile</span>
              </div>
              <div
                className={styles.menuItem}
                onClick={() => handleNavigation("/user/orders")}
              >
                <IoBagHandleOutline className={styles.icon} />
                <span>My Orders</span>
              </div>
            </div>
          )}

          {/* Categories */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <IoGridOutline className={styles.titleIcon} />
              Shop by Category
            </div>
            <div className={styles.categoryList}>
              {categories && categories.length > 0 ? (
                categories.map((cat: any) => {
                  const catId = cat.id || cat._id;
                  return (
                    <div key={catId} className={styles.categoryItem}>
                      <div
                        className={`${styles.categoryHeader} ${
                          expandedCategories.includes(catId)
                            ? styles.active
                            : ""
                        }`}
                        onClick={() => toggleCategory(catId)}
                      >
                        <span>{cat.name}</span>
                        {cat.sub_categories &&
                          cat.sub_categories.length > 0 && (
                            <span className={styles.expandIcon}>
                              {expandedCategories.includes(catId) ? (
                                <IoChevronDown />
                              ) : (
                                <IoChevronForward />
                              )}
                            </span>
                          )}
                      </div>

                      {/* Subcategories Accordion */}
                      <div
                        className={`${styles.subCategoryList} ${
                          expandedCategories.includes(catId)
                            ? styles.expanded
                            : ""
                        }`}
                      >
                        {cat.sub_categories &&
                          cat.sub_categories.map((sub: any) => {
                            const subId = sub.id || sub._id;
                            return (
                              <div
                                key={subId}
                                className={styles.subCategoryItem}
                                onClick={() =>
                                  handleNavigation(
                                    `/category/${sub.slug}?id=${window.btoa(
                                      subId,
                                    )}&type=${encodeURIComponent(sub.name)}`,
                                  )
                                }
                              >
                                {sub.name}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyState}>No categories found</div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          {session?.user && (
            <div className={styles.footer}>
              <button
                className={styles.logoutBtn}
                onClick={() => {
                  clearReduxData(dispatch);
                  signOut({ callbackUrl: "/" });
                  onClose();
                }}
              >
                <IoLogOutOutline />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SideMenu;
