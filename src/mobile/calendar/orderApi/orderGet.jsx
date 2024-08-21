import axios from "axios";
// [주문자, 관리자] 주문 조회
const orderGet = async (orderId) => {
  try {
    // 로컬에서 토큰 가져오기
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.get(
      `https://api.yellobook.site/api/v1/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("[주문자, 관리자] 주문 조회:", error);
    throw error;
  }
};

export default orderGet;