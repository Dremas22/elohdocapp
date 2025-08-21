import ChatList from "./ChatList";
import UserInfo from "./UserInfo";

const List = () => {
  return (
    <div className="flex flex-1 flex-col">
      <UserInfo />
      <ChatList />
    </div>
  );
};

export default List;
