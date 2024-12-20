import React, { useEffect, useState } from "react";
import { ReactComponent as Close } from "../../assets/mobile/calendar/close.svg";
import { ReactComponent as DropButton } from "../../assets/mobile/calendar/dropdown.svg";
import Search from "../../assets/mobile/calendar/search.svg";
import { PostNotice } from "../../util/NoticeUtils";
import { useNavigate } from "react-router-dom";
import { getMembers } from "../../util/TeamUtils";
import {
  inventoryName,
  inventorySubName,
} from "../../util/InventorySearchUtils";
import { orderWrite } from "../../util/OrderUtils";
import PermissionProvider from "../../util/Context";
import { useIsCustomer } from "../../util/Context";

const OrderContainer = ({ setIsModal }) => {
  //const memberList = [
  //  { id: 1, name: "Member1" },
  //  { id: 2, name: "Member2" },
  //];
  // 공지사항인 경우
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [mentionedIds, setMentionedIds] = useState([]);
  const [order, setOrder] = useState(false); // 공지사항 | 주문 => 비활성화 여부

  // 날짜 dropdown list
  const currentYear = new Date().getFullYear();
  const yearList = Array.from({ length: 3 }, (_, i) =>
    (currentYear + i).toString()
  ); // 현재 연도를 기준으로 ±2년
  const monthList = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  ); // 1~12월
  const [dayList, setDayList] = useState([]);

  // 선택된 연도와 월에 따라 일 목록 갱신
  useEffect(() => {
    if (year && month) {
      const daysInMonth = new Date(year, month, 0).getDate(); // 해당 월의 일 수 계산
      const days = Array.from({ length: daysInMonth }, (_, i) =>
        (i + 1).toString().padStart(2, "0")
      );
      setDayList(days);
    }
  }, [year, month]);

  const navigate = useNavigate();

  const isCustomer = useIsCustomer();

  //const isLoading = isCustomer === null;

  // 공지사항 or 주문
  console.log("사용자 권한 뭐임?:", isCustomer);
  const OrderNotice = isCustomer ? ["주문", "공지사항"] : ["공지사항"];

  // 제품 ID, 메모, 날짜, 주문 수량을 상태로 관리
  const [productId, setProductId] = useState();
  const [memo, setMemo] = useState("");
  const [orderAmount, setOrderAmount] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // 제품 이름
  const [productName, setProductName] = useState("");

  // 제품 하위 이름
  const [productSubNames, setProductSubNames] = useState([]);

  // 멤버 이름 - 조회
  const [memberName, setMemberName] = useState([]);
  // 멤버 선택 상태
  const [selectedMembers, setSelectedMembers] = useState([]);

  // 멤버 이름 넘기는 값
  const [postName, setPostName] = useState("");

  // Dropdown 선택 핸들러
  const handleYearSelect = (item) => setYear(item);
  const handleMonthSelect = (item) => setMonth(item);
  const handleDaySelect = (item) => setDay(item);
  //const handleMemberSelect = (item) => setMentionedId(item.id);
  const handleItem = (item) => setPostName(item);

  const formattedDate = `${year}-${month}-${day}`;

  // 여러 멤버 선택 핸들러
  const handleMemberSelect = (item) => {
    setMentionedIds((prev) =>
      prev.includes(item.memberId)
        ? prev.filter((member) => member !== item.memberId)
        : [...prev, item.memberId]
    );
  };

  const mentionIds = selectedMembers.map((member) => member.id);

  // 공지사항 -> 일정 게시하기 버튼 핸들러
  const handleNotice = async () => {
    try {
      const noticeData = {
        title,
        memo,
        mentionIds,
        date: formattedDate,
      };

      const response = await PostNotice(noticeData);

      console.log("공지사항 작성 성공:", response);
      console.log("NoticeData:", noticeData); // API 호출 전 확인용
      //setInformId(response.data.informId);
      if (response && response.data.informId) {
        navigate(`/notice/${response.data.informId}`);
      }

      // 주문 작성 성공 시의 추가 처리
    } catch (error) {
      console.error("공지사항 작성 실패:", error);
      // 주문 작성 실패 시의 추가 처리
    }
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setOrder(item === "주문"); // 주문인 경우 공지 제목 비활성화 위함
  };

  // 하위 제품 선택
  const handleProductSelect = (selectedName) => {
    console.log("Selected Name: ", selectedName);

    const selectedProduct = productSubNames.find(
      (subProduct) => subProduct.name === selectedName.name
    );
    if (selectedProduct) {
      setProductId(selectedProduct.id); // 선택한 하위 제품의 ID를 설정
      console.log("Selected Product ID:", selectedProduct.id);
    } else {
      console.log("Product not found.");
    }
  };

  // 주문 -> 일정 게시하기 버튼 핸들러
  const handleOrder = async () => {
    try {
      const response = await orderWrite(
        productId,
        memo,
        formattedDate,
        orderAmount
      );
      console.log("주문 작성 성공:", response);
      const orderId = response.data.orderId;
      navigate(`/order/${orderId}`);
      // 주문 작성 성공 시의 추가 처리
    } catch (error) {
      console.error("주문 작성 실패:", error);
      //console.log("들어간 값: ", productId, memo, formattedDate, orderAmount);
      // 주문 작성 실패 시의 추가 처리
    }
  };

  // 일정 게시하기 버튼 클릭 핸들러
  const handleButtonClick = () => {
    if (selectedItem === "공지사항") {
      handleNotice();
    } else if (selectedItem === "주문") {
      handleOrder();
    }
  };

  // 제품 이름으로 제품 조회
  const handleName = async () => {
    try {
      const response = await inventoryName(productName);
      console.log("제품 데이터:", response.data.names);

      // 제품 이름으로 하위 제품 조회
      await handleSubNameList();
    } catch (error) {
      console.error("제품 이름 조회 실패: ", error);
    }
  };

  // 제품 이름으로 하위 제품 조회
  const handleSubNameList = async () => {
    try {
      const response = await inventorySubName(productName);
      if (response && response.data.subProducts) {
        const subProducts = response.data.subProducts.map((subProduct) => ({
          id: subProduct.productId,
          name: subProduct.subProductName,
        }));
        setProductSubNames(subProducts);
      }
      console.log("제품 하위 이름 조회: ", response);
    } catch (error) {
      console.error("제품 하위 이름 조회 실패: ", error);
    }
  };

  // 팀 내의 모든 멤버 조회
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getMembers();
        if (response && response.data.members) {
          const members = response.data.members.map((member) => ({
            id: member.memberId,
            name: member.nickname,
          }));
          setMemberName(members);
          // 모든 멤버의 ID만 추출해서 setMentionedIds에 저장
          const memberIds = members.map((member) => member.id);
          setMentionedIds(memberIds);
          console.log("주문 모달에서 팀 멤버 조회:", response);
        } else {
          console.log(
            "멤버가 존재하지 않거나, 데이터를 가져오는데 실패했습니다."
          );
        }
      } catch (error) {
        console.error("팀 멤버 조회 실패:", error);
      }
    };

    fetchMembers(); // 컴포넌트 마운트 시 멤버 목록 가져오기
  }, []);
  // const handleGetMember = async () => {
  //   try {
  //     const response = await getMembers();
  //     if (response && response.data.members) {
  //       const members = response.data.members.map((member) => ({
  //         id: member.memberId,
  //         name: member.nickname,
  //       }));
  //       setMemberName(members);
  //     }
  //     console.log("주문 모달에서 팀 멤버 조회: ", response);
  //   } catch (error) {
  //     console.error("팀 멤버 조회 실패: ", error);
  //   }
  // };

  // useEffect(() => {
  //   handleGetMember(); // 컴포넌트 마운트 시 멤버 목록 가져오기
  // }, []);

  // useEffect(() => {
  //   handleSubNameList();
  // }, [handleName]);

  return (
    <PermissionProvider>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-[18.75rem] h-[34.625rem] relative bg-white rounded-[2.5rem] flex flex-col items-center">
          <Close
            className="absolute top-[1rem] right-[1.75rem]"
            onClick={() => {
              setIsModal(false);
            }}
          />
          <div className="px-[2rem] pt-[3.5rem] pb-[1.5rem]">
            <div className="flex justify-between mb-[1.25rem]">
              <div flex items-center>
                <Text size="text-base" color="text-black">
                  날짜
                </Text>
              </div>
              <div className="flex items-center gap-[0.25rem] z-50 text-sm text-customGray">
                <div className="flex items-center">
                  <DropDown
                    width="4.25rem"
                    height="1.5rem"
                    size="0.9375rem"
                    items={yearList}
                    wid="4rem"
                    hei="1.5rem"
                    onSelect={handleYearSelect}
                  />
                  <Text size="text-sm" color="text-dateGray">
                    년
                  </Text>
                </div>
                <div className="flex items-center">
                  <DropDown
                    width="2.75rem"
                    height="1.5rem"
                    items={monthList}
                    size="0.9375rem"
                    wid="2rem"
                    hei="1.5rem"
                    onSelect={handleMonthSelect}
                  />
                  <Text size="text-sm" color="text-dateGray">
                    월
                  </Text>
                </div>
                <div className="flex items-center">
                  <DropDown
                    width="2.75rem"
                    height="1.5rem"
                    items={dayList}
                    size="0.9375rem"
                    wid="2rem"
                    hei="1.5rem"
                    onSelect={handleDaySelect}
                  />
                  <Text size="text-sm" color="text-dateGray">
                    일
                  </Text>
                </div>
              </div>
            </div>
            <DropDown
              width="15rem"
              height="1.5rem"
              hint="일정 종류"
              weight="font-median"
              className="z-40"
              items={OrderNotice}
              size="0.9375rem"
              hintColor="text-dateGray"
              wid="13rem"
              hei="1.5rem"
              onSelect={handleSelect}
            />
            <div className="mt-[1.25rem] mb-[1.5rem]">
              <h1>공지 제목</h1>
              <div className="w-[15rem] h-[2.0625rem] border border-[#FFDE33] text-xs font-light flex items-center">
                <input
                  className="w-full h-full m-0 p-1 placeholder-customGray1"
                  placeholder="공지 또는 업무 타이틀을 입력해주세요."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={order}
                />
              </div>
            </div>
            <div className="flex flex-col gap-[0.5rem]">
              <div className="flex justify-between">
                <h1>제품</h1>
                <div className="flex justify-between w-[10.5625rem] h-[1.5rem] border border-[#FFDE33] text-xs font-light items-center pr-1">
                  <input
                    className="placeholder-customGray1 w-[8.0625rem]"
                    placeholder="제품 명을 입력해주세요."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    disabled={!order}
                  />
                  <img
                    src={Search}
                    alt="돋보기 아이콘"
                    onClick={order ? handleName : undefined}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <h1>하위제품</h1>
                <DropDown
                  width="10.5625rem"
                  height="1.5rem"
                  items={productSubNames}
                  size="0.75rem"
                  wid="9rem"
                  hei="1.5rem"
                  onSelect={handleProductSelect}
                />
              </div>
              <div className="flex justify-between">
                <h1>주문수량</h1>
                <div className="w-[10.5625rem] h-[1.5rem] border border-[#FFDE33] flex items-center">
                  <input
                    className="w-full h-full text-xs font-light m-0 p-1"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    disabled={!order}
                  />
                </div>
              </div>
            </div>
            <div className="mt-[1.25rem]">
              <h1>메모</h1>
              <div className="w-[15rem] h-[3.5rem] border border-[#FFDE33]">
                <textarea
                  className="w-full h-full text-xs font-light p-1 placeholder-customGray1"
                  placeholder="주문 또는 공지와 업무에 관한 상세 정보나 메모를 입력해주세요."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between mt-[0.5rem]">
              <h1>함께하는 멤버</h1>
              <MultiSelectDropDown
                items={memberName} // 조회된 멤버 리스트
                selectedMembers={selectedMembers}
                setSelectedMembers={setSelectedMembers}
              />
            </div>
          </div>
          <button
            className="w-[15rem] h-[2.3125rem] bg-[#FFDE33] rounded-[1.875rem] text-lg"
            onClick={handleButtonClick}
          >
            일정 게시하기
          </button>
        </div>
      </div>
    </PermissionProvider>
  );
};
export default OrderContainer;

// dropdown
const DropDown = ({
  width,
  height,
  size,
  hint,
  color,
  weight,
  items,
  hintColor = "text-customGray1",
  wid,
  hei,
  onSelect,
  selectedMember,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 토글 클릭 이벤트
  const toggleDropdown = (e) => {
    setIsOpen(!isOpen);
  };

  // 항목 클릭 이벤트
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsOpen(false); // 선택 후 드롭다운 닫기
    if (onSelect) {
      onSelect(item); // 선택한 아이템 부모 컴포넌트에 전달
    }
  };

  return (
    <div
      className={`relative`}
      style={{
        width: width,
        height: height,
      }}
    >
      <div
        className={`bg-white border border-[#FFDE33] flex items-center p-[0.0625rem] ${color} ${weight} cursor-pointer text-[${size}] pl-1`}
        onClick={toggleDropdown}
        style={{ boxSizing: "border-box", minHeight: hei, minWidth: wid }}
      >
        {selectedItem ? (
          typeof selectedItem === "object" ? (
            <span>{selectedItem.name}</span>
          ) : (
            <span>{selectedItem}</span>
          )
        ) : (
          <span className={`text-[${size}] ${hintColor}`}>{hint}</span>
        )}
        <button className="absolute right-1" onClick={toggleDropdown}>
          <DropButton />
        </button>
      </div>
      {isOpen && (
        <ul
          className="absolute mt-[0.0625rem] w-full bg-white shadow-lg border border-[#FFDE33] overflow-y-auto"
          style={{ maxHeight: "10rem" }}
        >
          {items.map((item, index) => (
            <DropDownItem
              key={index}
              item={item}
              onClick={handleItemClick}
              fontSize="0.75rem"
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export const DropDownItem = ({ item, onClick, fontSize }) => {
  return (
    <li
      className="py-[0.0625rem] px-[0.125rem] cursor-pointer hover:bg-gray-100"
      onClick={() => onClick(item)}
      style={{ fontSize: fontSize }}
    >
      {typeof item === "object" ? item.name : item}
    </li>
  );
};

export const Text = ({ color, size, weight, children }) => {
  const textStyle = {
    fontSize: size,
    color: color,
    fontWeight: weight,
  };

  return (
    <p className={`${size} ${color} ${weight}`} style={textStyle}>
      {children}
    </p>
  );
};

// 함께하는 멤버 언급
const MultiSelectDropDown = ({
  items,
  selectedMembers,
  setSelectedMembers,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // 멤버 선택 핸들러
  const handleMemberSelect = (item) => {
    if (item.name === "전체") {
      // "전체" 항목 선택 시, 모든 멤버 선택
      if (selectedMembers.length === items.length) {
        // 이미 모두 선택된 경우, 전체 선택 해제
        setSelectedMembers([]);
      } else {
        // 전체 선택
        setSelectedMembers(items);
      }
    } else {
      if (selectedMembers.some((member) => member.id === item.id)) {
        // 이미 선택된 멤버라면 제거
        setSelectedMembers(
          selectedMembers.filter((member) => member.id !== item.id)
        );
      } else {
        // 새롭게 선택된 멤버 추가
        setSelectedMembers([...selectedMembers, item]);
      }
    }
  };

  return (
    <div
      className="relative"
      style={{ width: "8.25rem", height: "1.5rem", fontSize: "0.75rem" }}
    >
      <div
        className="bg-white border border-[#FFDE33] p-1 cursor-pointer flex items-center justify-between"
        onClick={toggleDropdown}
      >
        <div className="flex flex-wrap">
          {selectedMembers.length > 0 ? (
            selectedMembers.map((member) => (
              <span key={member.id} className="mr-2">
                {member.name}
              </span>
            ))
          ) : (
            <span className="text-customGray1">멤버 선택</span>
          )}
        </div>
        <DropButton /> {/* DropButton을 오른쪽에 위치시킴 */}
      </div>
      {isOpen && (
        <ul
          className="absolute mt-1 w-full bg-white shadow-lg border border-[#FFDE33] overflow-y-auto"
          style={{ maxHeight: "10rem" }}
        >
          {items.map((item, index) => (
            <li
              key={index}
              className={`py-1 px-2 cursor-pointer hover:bg-gray-100 ${
                selectedMembers.includes(item) ? "bg-yellow-100" : ""
              }`}
              onClick={() => handleMemberSelect(item)}
            >
              {item.name}
            </li>
          ))}
          <li
            className={`py-1 px-2 cursor-pointer hover:bg-gray-100 ${
              selectedMembers.length === items.length ? "bg-yellow-100" : ""
            }`}
            onClick={() => handleMemberSelect({ id: "all", name: "전체" })}
          >
            전체
          </li>
        </ul>
      )}
    </div>
  );
};
