import { useModal } from "../../context/Modal";
import { thunkCreateReaction } from "../../store/messages";
import { useDispatch } from "react-redux";

export default function ReactionModal({ socket, msg, user, dispatch }) {
    const { closeModal } = useModal();

    function handleAddReaction(e, msg, rxn) {
        e.preventDefault();
        dispatch(thunkCreateReaction(msg.id, { reaction: rxn }));
        socket.emit("addReaction", {
            user: user.username,
            reaction: rxn,
        });
    }
    const emojis = [
        "👍",
        "👎",
        "😀",
        "🤣",
        "😇",
        "🥰",
        "😛",
        "🤭",
        "😑",
        "🍆",
        "🙄",
        "😴",
        "💖",
        "💔",
        "💯",
        "👋",
        "😨","😧","😦","😱","😫","😩",
        "😮","😯","😲","😺","😸","🐱","😳","😞","😖","😈","😬","🤨","😉","😜","😣","😖","🤒","😷","🤢","😎","😪","🙂","😊","😁","🦀","💵","😔"
    ];
    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    maxWidth: "300px",
                    justifyContent: "center",
                }}
            >
                {emojis.map((emoji) => (
                    <button
                        style={{
                            padding: "2px 2px",
                            margin: "5px 5px",
                            fontSize: "16px",
                            fontSize: "18px",
                            borderRadius: "25%",
                            borderColor: "grey"
                        }}
                        onClick={(e) => {
                            handleAddReaction(e, msg, emoji);
                            closeModal();
                        }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </>
    );
}
