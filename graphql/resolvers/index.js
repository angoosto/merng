const postsResolvers = require("./posts");
const usersResolvers = require("./users");
const commentsResolvers = require("./comments");

module.exports = {
  Query: {
    ...postsResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation,
  },
  Post: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length
  }
};
