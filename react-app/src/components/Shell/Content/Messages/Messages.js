import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import {
    createChannelMessage,
    getChannelMessages,
    editMessage,
    destroyMessage,
    thunkDeleteReaction,
    thunkCreateReaction,
} from "../../../../store/messages";
import { OneChannelThunk } from "../../../../store/channel";
import { useParams } from "react-router-dom";
import Editor from "../../../ChatTest/Editor";
import ReactionModal from "../../../ReactionModal";
import OpenModalButton from "../../../OpenModalButton";
import { UserChannelThunk } from "../../../../store/channel";
import DeleteMessageModal from "../../../DeleteMessageModal"
let socket;
let updatedMessage;

const Messages = ({ selectedUserRightBar, setSelectedUserRightBar }) => {
    let editing = false;
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [reactions, setReactions] = useState([]);
    const user = useSelector((state) => state.session.user);
    const dispatch = useDispatch();
    const allMessages = useSelector((state) => state.messages.allMessages);
    const { channelId } = useParams();
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();

    const openMenu = () => {
        if (showMenu) return;
        setShowMenu(true);
    };

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
            if (!ulRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("click", closeMenu);

        return () => document.removeEventListener("click", closeMenu);
    }, [showMenu]);

    const currentChannel = useSelector(
        (state) => state.channels.single_channel
    );

    useEffect(() => {
        dispatch(OneChannelThunk(channelId));
        (async e => {
            await fetch(`/api/channels/${channelId}/users`, {
                method: "POST",

            })
            dispatch(UserChannelThunk())
        })()
    }, []);

    useEffect(() => {
        dispatch(getChannelMessages(channelId));
    }, [dispatch, messages, reactions, channelId]);

    useEffect(() => {
        dispatch(getChannelMessages(channelId)).then(() => {
            const element = document.getElementById("grid-content");
            if (element)
                element.scrollTop = element.scrollHeight;
        });
    }, [dispatch, messages, channelId]);

    useEffect(() => {
        // open socket connection
        // create websocket
        socket = io();
        if (socket)
            socket.emit("join", {
                channel_id: channelId,
                username: user.username,
            });

        socket.on("chat", (chat) => {
            setMessages((messages) => [...messages, chat]);
        });

        socket.on("delete", (chat) => {
            let messageIdx = messages.findIndex((msg) => msg === chat);
            let newMessages = messages.filter((_, idx) => idx !== messageIdx);
            setMessages(newMessages);
        });

        socket.on("edit", (chat) => {
            let messageIdx = messages.findIndex(
                (msg) => msg.id === chat.msg_id
            );
            messages[messageIdx] = chat;
            let newMessages;
            setMessages(newMessages);
        });

        socket.on("deleteReaction", (reaction) => {
            let reactionIdx = reactions.findIndex((rxn) => rxn === reaction);
            let newReactions = reactions.filter(
                (_, idx) => idx !== reactionIdx
            );
            setReactions(newReactions);
            // console.log(reactions);
        });

        socket.on("addReaction", (reaction) => {
            setReactions((reactions) => [...reactions, reaction]);
            // console.log(reactions);
        });
        // when component unmounts, disconnect
        return () => {
            socket.disconnect();
        };
    }, []);

    const updateChatInput = (e) => {
        setChatInput(e.target.value);
    };

    const updateEditMessageInput = (e) => {
        updatedMessage = e.target.value;
    };

    const sendChat = async (e) => {
        e.preventDefault();

        const newMessage = {
            user_id: user.id,
            channel_id: channelId,
            content: chatInput,
        };
        await dispatch(createChannelMessage(newMessage));
        if (socket)
            socket.emit("chat", { user: user.username, msg: chatInput });
        setChatInput("");
    };

    const handleDelete = (e, msg) => {
        dispatch(destroyMessage(msg.id));
        socket.emit("delete", { user: user.username, msg: msg.content });
    };

    const editMode = (e, msg) => {
        let content = document.getElementById(`msg-content-${msg.id}`);

        let editForm = document.createElement("form");
        editForm.id = "edit-msg-form";

        editForm.onsubmit = (e) => handleEdit(e, msg);

        let editInputBox = document.createElement("textarea");
        editInputBox.onchange = updateEditMessageInput;

        editInputBox.value = msg.content;
        editInputBox.style.backgroundColor = "#FFFFFF";
        editInputBox.style.padding = "5px 10px";
        editInputBox.style.marginTop = "5px";
        editInputBox.style.resize = "none";
        editInputBox.style.border = "1px solid #dddddd";
        editInputBox.style.borderRadius = "8px";
        editInputBox.style.width = "100%";

        let editInputSubmit = document.createElement("button");
        editInputSubmit.type = "submit";
        editInputSubmit.textContent = "Save";
        editInputSubmit.style.padding = "1px 4px";
        editInputSubmit.style.marginRight = "5px";
        editInputSubmit.style.marginTop = "4px";

        let cancelEditInput = document.createElement("button");
        cancelEditInput.textContent = "Cancel";
        cancelEditInput.style.padding = "1px 4px";
        cancelEditInput.style.marginTop = "4px";
        cancelEditInput.onclick = (e) => {
            document.getElementById("edit-msg-form").remove();
            editing = false;
        };

        editForm.appendChild(editInputBox);
        editForm.appendChild(editInputSubmit);
        editForm.appendChild(cancelEditInput);
        if (!editing) content.appendChild(editForm);
    };

    const handleEdit = async (e, msg) => {
        document.getElementById("edit-msg-form").remove();
        e.preventDefault();
        await dispatch(
            editMessage(
                {
                    content: updatedMessage,
                    user_id: user.id,
                    channel_id: channelId,
                    is_pinned: false,
                },
                msg.id
            )
        );

        socket.emit("edit", {
            user: user.username,
            msg: updatedMessage,
            msg_id: msg.id,
        });
    };

    function handleDeleteReaction(e, reaction) {
        e.preventDefault();
        dispatch(thunkDeleteReaction(reaction));
        socket.emit("deleteReaction", {
            user: user.username,
            reaction: reaction.reaction,
        });
    }
    function handleAddReaction(e, msg, rxn) {
        e.preventDefault();
        dispatch(thunkCreateReaction(msg.id, { reaction: rxn }));
        socket.emit("addReaction", {
            user: user.username,
            reaction: rxn,
        });
    }

    function hasUserReacted(message, user, reaction) {
        // Define logic for seeing whether
        // A user has posted a given reaction
        // To a given message
        let userReaction = Object.values(message.Reactions).filter(
            (rxn) => rxn.user_id === user.id && rxn.reaction === reaction
        );
        if (!userReaction.length) return null;
        return userReaction[0];
    }

    function storeConverter(msg, user) {
        if (!msg.Reactions) return null;
        let arr = Object.values(msg.Reactions);
        let emojiStuff = arr.map((el) => [el.reaction, el.id]);
        const counts = {};

        for (const num of emojiStuff) {
            if (!counts[num[0]]) {
                let countObj = {
                    frequency: 1,
                    reaction_ids: [num[1]],
                };

                counts[num[0]] = countObj;
                continue;
            }

            counts[num[0]].frequency++;
            counts[num[0]].reaction_ids.push(num[1]);
        }

        let countEntries = Object.entries(counts);

        return countEntries.map((el) => (
            <>

                {hasUserReacted(msg, user, el[0]) ? (


                    <button
                        style={{ padding: "0px 6px", backgroundColor: "#e7f3f9", border: "1px solid #bad3f2" }}
                        className="message-card-reaction"
                        onClick={(e) =>
                            handleDeleteReaction(
                                e,
                                hasUserReacted(msg, user, el[0]),
                                msg.id
                            )
                        }
                    >
                        <p style={{ paddingRight: "5px" }}>{el[0]}</p> <p style={{ fontSize: '12px', color: "#333333" }}>{counts[el[0]].frequency}</p>
                    </button >
                ) : (
                    <button
                        style={{ padding: "0px 6px" }}
                        className="message-card-reaction"
                        onClick={(e) => handleAddReaction(e, msg, el[0])}
                    >
                        {el[0]}{" "}
                        <span className="message-card-reaction-count">

                            <p style={{ paddingRight: "5px" }}>{counts[el[0]].frequency}</p>
                        </span>
                    </button>
                )
                }


            </>
        ));
    }

    function changeAdjustText(text, id) {
        document.getElementById(`message-adjust-text-${id}`).textContent = text;
    }

    function toggleRightPane(state) {
        if (state === "close") {
            document.getElementById("grid-container").className =
                "grid-container-hiderightside";
            document.getElementById("grid-rightside-heading").className =
                "grid-rightside-heading-hide";
            document.getElementById("grid-rightside").className =
                "grid-rightside-hide";
        } else {
            document.getElementById("grid-container").className =
                "grid-container";
            document.getElementById("grid-rightside-heading").className =
                "grid-rightside-heading";
            document.getElementById("grid-rightside").className =
                "grid-rightside";
        }
        window.toggleLeftPane();
    }





    const messageFunctions = {
        sendChat,
        handleEdit,
        chatInput,
        updateChatInput,
        currentChannel,
        channelId,
    };
    return user && currentChannel && allMessages ? (
        <>

            <div style={{ marginBottom: '10px' }}>



                {Object.values(allMessages).map((message, ind) => (



                    <div className="message-card"
                        key={message.id}
                        id={`message-${message.id}`}
                    >



                        <div>
                            <img onClick={(e) => {
                                setSelectedUserRightBar(message.User)
                                toggleRightPane();
                            }}
                                src={
                                    message.User ? message.User.avatar : user.avatar
                                }
                                alt={`${message.User
                                    ? message.User.first_name
                                    : user.first_name
                                    } ${message.User
                                        ? message.User.last_name
                                        : user.last_name
                                    }`}
                                style={{
                                    borderRadius: "5px",
                                    width: "36px",
                                    height: "36px",
                                }}
                            ></img>
                        </div>


                        <div className="message-card-content">

                            <div className="message-card-header">
                                <div>
                                    <span
                                        className="message-card-name"
                                        onClick={(e) => {
                                            setSelectedUserRightBar(message.User)
                                            toggleRightPane();
                                        }}
                                    >
                                        {message.User
                                            ? message.User.first_name
                                            : user.first_name}{" "}
                                        {message.User
                                            ? message.User.last_name
                                            : user.last_name}
                                    </span>
                                    <span className="message-card-time">
                                        {new Date(
                                            message.updated_at
                                        ).toLocaleTimeString([], {
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>

                                <div className="message-card-makechangebox">
                                    <span
                                        id={`message-adjust-text-${message.id}`}
                                        className="message-adjust-text"
                                    ></span>
                                    <span
                                        onMouseOver={(e) =>
                                            changeAdjustText("Add Reaction", message.id)
                                        }
                                        onMouseOut={(e) =>
                                            changeAdjustText("", message.id)
                                        }
                                        className="message-adjust-reaction"
                                    >
                                        <OpenModalButton
                                            modalComponent={
                                                <ReactionModal
                                                    socket={socket}
                                                    msg={message}
                                                    user={user}
                                                    dispatch={dispatch}
                                                />
                                            }
                                            className="far fa-smile"
                                        />
                                    </span>
                                    {/* <span
                                onMouseOver={(e) =>
                                    changeAdjustText("Pin Message", message.id)
                                }
                                onMouseOut={(e) =>
                                    changeAdjustText("", message.id)
                                }
                                className="message-adjust-pin"
                                onClick={(e) => alert("Feature coming soon!")}
                            >
                                <i className="far fa-dot-circle"></i>
                            </span> */}
                                    {user.id === message.user_id && (
                                        <span
                                            onClick={(e) => {
                                                editMode(e, message);
                                                editing = true;
                                            }}
                                            onMouseOver={(e) =>
                                                changeAdjustText(
                                                    "Edit Message",
                                                    message.id
                                                )
                                            }
                                            onMouseOut={(e) =>
                                                changeAdjustText("", message.id)
                                            }
                                            className="message-adjust-edit"
                                        >
                                            <i className="far fa-edit"></i>
                                        </span>
                                    )}

                                    {user.id === message.user_id && (
                                        <span
                                            onMouseOver={(e) =>
                                                changeAdjustText(
                                                    "Delete Message",
                                                    message.id
                                                )
                                            }
                                            onMouseOut={(e) =>
                                                changeAdjustText("", message.id)
                                            }
                                            className="message-adjust-delete"
                                        >
                                            <OpenModalButton
                                                modalComponent={
                                                    <DeleteMessageModal
                                                        socket={socket}
                                                        msg={message}
                                                        user={user}
                                                        dispatch={dispatch}
                                                    />
                                                }
                                                className="far fa-trash-alt"
                                            />
                                        </span>
                                    )}
                                </div>

                            </div>


                            <div style={{ overflowWrap: "anywhere" }} id={`msg-content-${message.id}`}>
                                {message.content} {message.updated_at !== message.created_at && <span style={{ color: "#888888", paddingLeft: '2px', fontSize: '13px' }}>(edited)</span>}
                            </div>

                            <div style={{}} className="message-card-footer">
                                {storeConverter(message, user)}
                            </div>

                        </div>


                    </div>
                ))}


            </div>


            {/* <div id="editor-holder" style={{ position: 'sticky', bottom: 0, backgroundColor: '#FFFFFF', width: '100%', overflow: 'hidden' }}> */}
            <div style={{ position: 'sticky', bottom: 0 }} >
                <Editor functions={messageFunctions} creating={true} setChatInput={setChatInput} user={user} />
            </div>

            {/* </div> */}



        </>
    ) : null;
};
export default Messages;
