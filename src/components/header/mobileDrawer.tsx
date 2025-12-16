import { Drawer } from "antd";

function MobileDrawer(props: any) {
  return (
    <Drawer
      placement={"left"}
      width={280}
      onClose={props?.close}
      open={props?.open}
      key={"left"}
      closeIcon={false}
    ></Drawer>
  );
}
export default MobileDrawer;
