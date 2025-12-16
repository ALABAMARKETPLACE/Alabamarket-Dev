import React from "react";

function SummaryCard(props: any) {
  return (
    <div className="SummaryCard">
      <table>
        <tr>
          <td>
            <b>Full Name</b>
          </td>
          <td>
            : {props?.data?.firstname}&nbsp;{props?.data?.lastname}
          </td>
        </tr>
        <tr>
          <td>
            <b>Phone Number</b> &nbsp;
          </td>
          <td>
            : {props?.data?.code}&nbsp;{props?.data?.phone}
          </td>
        </tr>
        <tr>
          <td>
            <b>Email Address</b>
          </td>
          <td>: {props?.data?.email}</td>
        </tr>
        <tr>
          <td>
            <b>Username</b>
          </td>
          <td>: {props?.data?.username}</td>
        </tr>
        <tr>
          <td>
            <b>Password</b>
          </td>
          <td>: ******</td>
        </tr>
      </table>
    </div>
  );
}
export default SummaryCard;
