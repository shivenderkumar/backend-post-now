import User from "../models/User.js";

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
}

export const getUserFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        console.log("user: ", user);

        // if (user.friends[0] == "") {
        //     res.status(200).json([]);
        // }
        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );
        console.log("friends: ", friends);

        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, occupation, locatoin, picturePath }) => {
                return { _id, firstName, lastName, occupation, locatoin, picturePath }
            }
        );
        res.status(200).json(formattedFriends);

    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
}

//UPDATE
export const addRemoveFriend = async (req, res) => {
    try {
        const { id, friendId } = req.params;
        console.log("id and friendId: "+id+" "+friendId);

        const user = await User.findById(id);
        const friend = await User.findById(friendId);

        console.log("user: ",user);
        console.log("friend: ",friend);

        if (user.friends.includes(friendId)) {
            user.friends = user.friends.filter((id) => id !== friendId);
            friend.friends = friend.friends.filter((id) => id !== id);
        } else {
            user.friends.push(friendId);
            friend.friends.push(id);
        }
        await user.save();
        await friend.save();

        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );
        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, occupation, locatoin, picturePath }) => {
                return { _id, firstName, lastName, occupation, locatoin, picturePath }
            }
        );
        res.status(200).json(formattedFriends);

    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
}