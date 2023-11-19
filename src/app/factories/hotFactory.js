/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
hensApp.factory('hotFactory', ['storageFactory', function (storageFactory) {
  let hot;
  return hot = {
    isPostHot: post => {
      if (moment(post.date).isAfter(moment().subtract(20, 'days'))) {
        const posts = storageFactory.get('seen.posts');
        return posts && !posts.find(seenPost => post.id === seenPost.id);
      } else {
        return false;
      }
    },
    isPostSeen: post => {
      const posts = storageFactory.get('seen.posts');
      return posts && posts.find(seenPost => post.id === seenPost.id);
    },

    isRPSeen: rp => {
      const seenRps = storageFactory.get('seen.rps');
      if (!seenRps) return false;
      const lastSeen = seenRps.find(seenRp => rp.id === seenRp.id);
      if (!lastSeen) {
        return false;
      } else {
        let last_post;
        if (rp.messages.length > 0) {
          last_post = rp.messages[rp.messages.length - 1].creationtime;
        } else {
          last_post = rp.creationtime;
        }
        return moment(lastSeen.seen_at).isAfter(last_post);
      }
    },

    isRPHot: (rp, id) => {
      if (moment(rp.last_post).isAfter(moment().subtract(20, 'days'))) {
        const seenRps = storageFactory.get('seen.rps');
        if (!Object.keys(rp.userList).find(rolistId => parseInt(rolistId) === id)) {
          return false;
        }
        const lastSeen = seenRps.find(seenRp => rp.id === seenRp.id);
        if (!lastSeen) {
          return true;
        } else {
          return moment(lastSeen.seen_at).isBefore(rp.last_post);
        }
      } else {
        return false;
      }
    },
    setPostSeen: post => {
      const seenPosts = storageFactory.get('seen.posts');
      const postIndex = seenPosts.findIndex(seenPost => seenPost.id === post.id);
      if (postIndex === -1) {
        seenPosts.push({
          id: post.id,
          author: post.author.ID,
          seen_at: new Date()
        });
        return storageFactory.set('seen.posts', seenPosts);
      }
    },

    setRPSeen: rp => {
      const seenRps = storageFactory.get('seen.rps');
      const rpIndex = seenRps.findIndex(seenRp => seenRp.id === rp.id);
      if (rpIndex >= 0) {
        seenRps[rpIndex].seen_at = new Date();
      } else {
        seenRps.push({
          id: rp.id,
          author: rp.owner.ID,
          seen_at: new Date()
        });
      }
      return storageFactory.set('seen.rps', seenRps);
    }
  };
}

]);