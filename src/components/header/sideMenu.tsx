import React, { useEffect, useRef, useState } from "react";
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
  IoBagHandleOutline,
  IoHomeOutline,
  IoSearchOutline,
  IoNewspaperOutline,
  IoCartOutline,
  IoHeartOutline,
  IoCallOutline,
} from "react-icons/io5";
import { useSelector as useReduxSelector } from "react-redux";

const SideMenu = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const categories = useSelector(reduxCategoryItems) as any[];
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session }: any = useSession();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const cart = useReduxSelector(
    (state: { Cart: { items: unknown[] } }) => state.Cart,
  );

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setExpandedId(null);
      contentRef.current?.scrollTo({ top: 0 });
    }
  }, [open]);

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  const toggleCategory = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const user = session?.user;
  const initials = user
    ? ((user.first_name?.[0] ?? user.name?.[0] ?? "U") as string).toUpperCase()
    : null;

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.sideMenu} ${open ? styles.open : ""}`}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerBg} />
          <div className={styles.headerContent}>
            <div className={styles.userInfo}>
              {user ? (
                user.image ? (
                  <img src={user.image} alt="avatar" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarInitials}>{initials}</div>
                )
              ) : (
                <div className={styles.avatarGuest}>
                  <IoPersonOutline size={22} />
                </div>
              )}
              <div className={styles.userDetails}>
                {user ? (
                  <>
                    <span className={styles.greeting}>Hello,</span>
                    <span className={styles.username}>
                      {user.first_name ?? user.name ?? "User"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={styles.greeting}>Welcome back</span>
                    <span
                      className={styles.signInLink}
                      onClick={() => go("/login")}
                    >
                      Sign in or Register →
                    </span>
                  </>
                )}
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
              <IoClose size={20} />
            </button>
          </div>

          {/* Quick action bar */}
          <div className={styles.quickActions}>
            <div className={styles.qaItem} onClick={() => go("/")}>
              <IoHomeOutline size={20} />
              <span>Home</span>
            </div>
            <div className={styles.qaItem} onClick={() => go("/product_search")}>
              <IoSearchOutline size={20} />
              <span>Search</span>
            </div>
            <div className={styles.qaItem} onClick={() => go("/cart")} style={{ position: "relative" }}>
              <IoCartOutline size={20} />
              {cart.items.length > 0 && (
                <span className={styles.qaBadge}>{cart.items.length}</span>
              )}
              <span>Cart</span>
            </div>
            <div className={styles.qaItem} onClick={() => go("/news")}>
              <IoNewspaperOutline size={20} />
              <span>News</span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className={styles.content} ref={contentRef}>

          {/* Auth buttons (guest) */}
          {!user && (
            <div className={styles.authSection}>
              <button className={styles.authBtnPrimary} onClick={() => go("/login")}>
                Sign In
              </button>
              <button className={styles.authBtnOutline} onClick={() => go("/signup")}>
                Create Account
              </button>
            </div>
          )}

          {/* My Account links */}
          {user && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>My Account</div>
              <div className={styles.menuItem} onClick={() => go("/user/profile")}>
                <div className={styles.menuIconWrap}><IoPersonOutline size={18} /></div>
                <span>Profile</span>
                <IoChevronForward size={14} className={styles.menuChevron} />
              </div>
              <div className={styles.menuItem} onClick={() => go("/user/orders")}>
                <div className={styles.menuIconWrap}><IoBagHandleOutline size={18} /></div>
                <span>My Orders</span>
                <IoChevronForward size={14} className={styles.menuChevron} />
              </div>
              <div className={styles.menuItem} onClick={() => go("/user/wishlist")}>
                <div className={styles.menuIconWrap}><IoHeartOutline size={18} /></div>
                <span>Wishlist</span>
                <IoChevronForward size={14} className={styles.menuChevron} />
              </div>
            </div>
          )}

          {/* Categories */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Shop by Category</div>
            <div className={styles.categoryList}>
              {categories?.length > 0 ? (
                categories.map((cat: any) => {
                  const catId = String(cat._id ?? cat.id ?? "");
                  const isOpen = expandedId === catId;
                  const hasSubs = Array.isArray(cat.sub_categories) && cat.sub_categories.length > 0;
                  const cleanName = (cat.name ?? "").replace(/\s*line\s*$/i, "");

                  return (
                    <div key={catId} className={styles.categoryItem}>
                      <div
                        className={`${styles.categoryRow} ${isOpen ? styles.categoryRowOpen : ""}`}
                        onClick={() => {
                          if (hasSubs) {
                            toggleCategory(catId);
                          } else {
                            const encoded = typeof window !== "undefined" ? window.btoa(catId) : catId;
                            go(`/category/${catId}?id=${encoded}&type=${encodeURIComponent(cleanName)}&categoryId=${encodeURIComponent(catId)}`);
                          }
                        }}
                      >
                        {cat.image ? (
                          <img src={cat.image} alt={cleanName} className={styles.catThumb} />
                        ) : (
                          <div className={styles.catThumbFallback}>
                            {cleanName[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                        <span className={styles.catName}>{cleanName}</span>
                        {hasSubs && (
                          <span className={styles.catChevron}>
                            {isOpen ? <IoChevronDown size={15} /> : <IoChevronForward size={15} />}
                          </span>
                        )}
                      </div>

                      {/* Subcategories */}
                      {hasSubs && (
                        <div className={`${styles.subList} ${isOpen ? styles.subListOpen : ""}`}>
                          {cat.sub_categories.map((sub: any) => {
                            const subId = String(sub._id ?? sub.id ?? "");
                            const subName = sub.name ?? "";
                            return (
                              <div
                                key={subId}
                                className={styles.subItem}
                                onClick={() =>
                                  go(
                                    `/category/${sub.slug ?? subId}?id=${
                                      typeof window !== "undefined" ? window.btoa(subId) : subId
                                    }&type=${encodeURIComponent(subName)}`,
                                  )
                                }
                              >
                                <span className={styles.subDot} />
                                {subName}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={styles.emptyState}>No categories found</div>
              )}
            </div>
          </div>

          {/* Help */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Support</div>
            <div className={styles.menuItem} onClick={() => go("/contact")}>
              <div className={styles.menuIconWrap}><IoCallOutline size={18} /></div>
              <span>Contact Us</span>
              <IoChevronForward size={14} className={styles.menuChevron} />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        {user && (
          <div className={styles.footer}>
            <button
              className={styles.logoutBtn}
              onClick={() => {
                clearReduxData(dispatch);
                signOut({ callbackUrl: "/" });
                onClose();
              }}
            >
              <IoLogOutOutline size={18} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;
