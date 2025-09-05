import ChatList from "./ChatList";
import UserInfo from "./UserInfo";

const List = ({ setOpenChat }) => {
  return (
    <div className="flex flex-1 flex-col">
      <UserInfo setOpenChat={setOpenChat} />
      <ChatList />
    </div>
  );
};

export default List;
