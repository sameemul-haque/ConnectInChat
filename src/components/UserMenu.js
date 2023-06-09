import { Icon } from "@iconify/react";
import SignOut from "./SignOut";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";

function UserMenu() {
  return (
    <>
      <Sidebar>
        <Menu>
          <SubMenu label="Charts">
            <MenuItem> {<SignOut />} </MenuItem>
            <MenuItem> Line charts </MenuItem>
          </SubMenu>
          <MenuItem> Documentation </MenuItem>
          <MenuItem> Calendar </MenuItem>
        </Menu>
      </Sidebar>
      ;
    </>
  );
}

export default UserMenu;
