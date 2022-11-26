import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  Image,
  Pressable,
  RefreshControl
} from "react-native";
import { EvilIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/FontAwesome";
import Post from "../components/Post.js";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { db } from "../../FirebaseApp";
import { auth } from "../../FirebaseApp";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { FloatingAction } from "react-native-floating-action";

const CommunityScreen = ({ navigation, route }) => {
  // State Variables
  const sheetRef = useRef(null);
  const snapPoints = ["75%", "100%"];
  const [postsList, setPostsList] = useState([]);
  const [postBtnVisible, setPostBtnVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleClosePress = () => sheetRef.current.close();
  const handleOpenPress = () => sheetRef.current.snapToIndex(0);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.75}
      />
    ),
    []
  );

  const startRefreshing = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 3000);
  };

  const fetchPosts = async () => {
    const postQuery = query(collection(db, "post"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(postQuery);
    const postsPromises = querySnapshot.docs.map(async (post) => {
      const userRef = doc(db, "users", post.data().userEmail);
      const user = await getDoc(userRef);
      if (user.exists()) {
        var minutes = "";
        if (post.data().createdAt) {
          const date = post.data().createdAt.toDate();
          minutes =
            date.getDate() +
            "-" +
            (date.getMonth() + 1) +
            "-" +
            date.getFullYear() +
            " " +
            date.getHours() +
            ":" +
            date.getMinutes();
        }

        return {
          userAvatar: user.data().icon,
          username: user.data().name,
          title: post.data().title,
          description: post.data().description,
          createdAt: minutes,
          postID: post.id,
          commentsNum: post.data().comments.length,
          likesNum: post.data().likes.length,
          didCurrUserLike: 
            post.data().likes.includes(auth.currentUser.email)
        }
      } else {
        console.log("No such document!");
      }
    });
    const postsFromFirebase = await Promise.all(postsPromises);
    setPostsList(postsFromFirebase);
  }

  const renderItem = ({ item }) => {

    return (
      <Pressable
        style={[styles.postContainer]}
        onPress={() => {
          navigation.navigate("Post Detail", {item: item});
        }}
      >
        <View style={styles.postHeader}>
          {/* Post header */}
          <Image style={styles.userAvatar} source={{ url: item.userAvatar }} />
          <View>
            <Text style={[{marginLeft: 8, color: '#C5F277', fontSize: 20 }]}>
              {item.username}
            </Text>
            <Text style={[{marginLeft: 8, color: '#B17BFF', fontSize: 16}]}>{item.createdAt}</Text>
          </View>
        </View>
        <Text
          style={[
            {
              color: "#C5F277",
              fontSize: 20,
              marginHorizontal: 13,
              paddingBottom: 10,
              fontWeight: 'bold'
            },
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <View style={
              { backgroundColor: 'black',
                marginHorizontal: 5,
                height: 82,
                borderRadius: 10,
                opacity: 0.9
              }}>
          <Text
            style={[
              {
                color: "#C5F277",
                fontSize: 20,
                marginHorizontal: 8,
                height: 82,
                lineHeight: 22,
              },
            ]}
            numberOfLines={3}
          > 
            {item.description}
          </Text>
        </View>
        <View style={styles.likeCommentContainer}>
          <View style={styles.likeContainer}>
            <AntDesign 
              style={styles.likeComment} 
              name={item.didCurrUserLike ? 'like1' : 'like2'}
              size={25} 
              color="#B17BFF" />
            <Text style={styles.likeCommentNum}>{item.likesNum}</Text>
          </View>
          <View style={styles.commentContainer}>
            <AntDesign style={styles.likeComment} name="message1" size={25} color="#B17BFF" />
            <Text style={styles.likeCommentNum}>{item.commentsNum}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  useFocusEffect(
    useCallback(() => {
      console.log("fetchPost called");
      try {
        fetchPosts();
      } catch (err) {
        console.log(err);
      }
    }, []) 
  );

  const actions = [
    {
      icon: <Icon name="plus" color={"black"} size={30} style={{height: 28}} />,
      name: "Post"
    }
  ];

  return (
    <View
      style={[
        styles.container
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 50,
          marginHorizontal: 20,
          marginTop: 10,
        }}
      >
        {/* Header: Title + Chat button/icon */}
        <Text
          style={[styles.screenHeading, {fontWeight: 'bold'}]}
        >
          My Feeds
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Chats List");
          }}
        >
          <Ionicons style={styles.icon} name="chatbox-ellipses" size={35} />
        </TouchableOpacity>
      </View>
      <View style={[styles.postFeed, {backgroundColor: 'white'}]}>
        {/* Post feed should go here */}
        <FlatList data={postsList} 
                  renderItem={renderItem} 
                  onScrollEndDrag={() => setPostBtnVisible(true)}
                  onScrollBeginDrag={() => setPostBtnVisible(false)}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{height: 10}} />}
                  style={{ borderRadius: 25, margin: 10, marginTop: 0}}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={fetchPosts}
                    />
                  }
                  />
        <View style={{position: 'absolute', right: -10, bottom: -10}}>
          <FloatingAction
            visible={postBtnVisible}
            actions={actions}
            overrideWithAction={true}
            color={'#C5F277'}
            onPressItem={handleOpenPress}
          />
        </View>
      </View>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}        
      >
        <BottomSheetView>
          <Post
            postResult={(data) => {
              if (data === true) {
                fetchPosts();
                handleClosePress();
              }
            }}
          />
        </BottomSheetView>
      </BottomSheet>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  screenHeading: {
    fontSize: 30,
    fontWeight: "400"
  },
  icon: {
    padding: 3,
  },
  plusIcon: {
    backgroundColor: "#001c00",
    width: 50,
    height: 50,
    // marginHorizontal: 20,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    // marginVertical: 20,
    alignSelf: "flex-end",
  },
  postFeed: {
    flex: 2,
    height: "100%",
  },
  postContainer: {
    borderRadius: 25,
    backgroundColor: 'black',
    height: 235,

    shadowOffset:{width:0, height:5},  
    shadowColor:'#171717',  
    shadowOpacity:0.2,  
    shadowRadius:2,  
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    position: 'relative',
  },
  userAvatar: {
    height: 45,
    width: 45,
    borderRadius: 40,
    marginLeft: 8,
    marginTop: 8
  },


  likeCommentContainer: {
    flexDirection: 'row',
    // backgroundColor: 'green',
    position: 'absolute',
    bottom: 10,
    left: 15
  },
  likeContainer: {
    flexDirection: 'row',
    // backgroundColor: 'yellow',
    marginRight: 10,
    
  },
  commentContainer: {
    flexDirection: 'row',
    // backgroundColor: 'blue',
    position: 'absolute',
    left: 70
  },
  likeComment: {

  },
  likeCommentNum: {
    fontSize: 20,
    lineHeight: 28,
    color: '#B17BFF',
    marginLeft: 5
  }
});

export default CommunityScreen;
