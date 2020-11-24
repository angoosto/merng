const { AuthenticationError, UserInputError } = require("apollo-server");
const { argsToArgsConfig } = require("graphql/type/definition");

const { check } = require("prettier");
const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: 1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postID }) {
      try {
        const post = await Post.findById(postID);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      const user = checkAuth(context);

      if (args.body.trim() === "") {
        throw new Error("Post must not be empty");
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      return post;
    },

    async deletePost(_, { postID }, context) {
      const user = checkAuth(context);

      try {
        const post = await Post.findById(postID);
        if (user.username === post.username) {
          await post.delete();
          return "Post deleted";
        } else {
          throw new AuthenticationError(
            "Not allowed - you can only delete your own posts"
          );
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postID }, context) {
      const { username } = checkAuth(context);
      const post = await Post.findById(postID);

      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          //Post already liked, unlike
          post.likes = post.likes.filter((like) => like.username !== username);
          await post.save();
        } else {
          //Not liked yet
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
