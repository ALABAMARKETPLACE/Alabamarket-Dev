interface responseType {
    eligibleItems: any[];
    nonEligibleItems: any[];
    status: boolean;
  }
  export const checkoutCartItems = async (data: any[]) => {
    try {
      if (Array.isArray(data) === true) {
        const checkoutItems: responseType = data.reduce(
          (items: responseType, item: any) => {
            const product = {
              ...item,
              buyPrice: Number(item?.price),
              name: item?.name,
              totalPrice: Number(item?.price * item.quantity),
            };
            if (
              item?.status == true &&
              Number(item?.unit >= Number(item?.quantity))
            ) {
              items.eligibleItems?.push(product);
            } else {
              items.nonEligibleItems?.push(product);
              items.status = false;
            }
  
            return items;
          },
          { eligibleItems: [], nonEligibleItems: [], status: true }
        );
        return checkoutItems;
      }
      return { eligibleItems: [], nonEligibleItems: [], status: false };
    } catch (err) {
      return { eligibleItems: [], nonEligibleItems: [], status: false };
    }
  };
  