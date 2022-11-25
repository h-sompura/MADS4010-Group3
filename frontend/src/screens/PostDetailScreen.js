import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView
} from "react-native";
import { EvilIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/FontAwesome";
import Post from "../components/Post.js";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { db } from "../../FirebaseApp";
import { auth } from "../../FirebaseApp";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import { FloatingAction } from "react-native-floating-action";
import Comment from "../components/Comment.js";

const PostDetailScreen = ({navigation, route}) => {
    const [postInfo] = useState(route.params.item);
    const [isOpen, setOpen] = useState(false);
    const sheetRef = useRef(null);
    const snapPoints = ["58%"];
    const [likeButton, setLikeButton] = useState("like2");
    const [likesNum, setLikesNum] = useState(0);
    const [commentsNum, setCommentsNum] = useState(5);
    const [comments, setComments] = useState([
        {
            username: 'Peter',
            userPhoto: 
            'https://firebasestorage.googleapis.com/v0/b/budgetapp-14956.appspot.com/o/userAvatars%2Fpeter%40email.com?alt=media&token=3630d778-97b4-42ca-b767-633f557a0e8f',
            review: 'If you’re trying to stick to a low-carb diet, just looking at numbers of calories on a menu won’t be that useful.'
        },
        {
            username: 'Peter',
            userPhoto: 
            'https://firebasestorage.googleapis.com/v0/b/budgetapp-14956.appspot.com/o/userAvatars%2Fpeter%40email.com?alt=media&token=3630d778-97b4-42ca-b767-633f557a0e8f',
            review: 'If you’re trying to stick to a low-carb diet, just looking at numbers of calories on a menu won’t be that useful.'
        },
        {
            username: 'Peter',
            userPhoto: 
            'https://firebasestorage.googleapis.com/v0/b/budgetapp-14956.appspot.com/o/userAvatars%2Fpeter%40email.com?alt=media&token=3630d778-97b4-42ca-b767-633f557a0e8f',
            review: 'If you’re trying to stick to a low-carb diet, just looking at numbers of calories on a menu won’t be that useful.'
        },
        {
            username: 'Peter',
            userPhoto: 
            'https://firebasestorage.googleapis.com/v0/b/budgetapp-14956.appspot.com/o/userAvatars%2Fpeter%40email.com?alt=media&token=3630d778-97b4-42ca-b767-633f557a0e8f',
            review: 'If you’re trying to stick to a low-carb diet, just looking at numbers of calories on a menu won’t be that useful.'
        },
        {
            username: 'Peter',
            userPhoto: 
            'https://firebasestorage.googleapis.com/v0/b/budgetapp-14956.appspot.com/o/userAvatars%2Fpeter%40email.com?alt=media&token=3630d778-97b4-42ca-b767-633f557a0e8f',
            review: 'If you’re trying to stick to a low-carb diet, just looking at numbers of calories on a menu won’t be that useful.'
        },
    ]);
 
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

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{ flexDirection: "row", position: "relative"}}>
                <Pressable
                    style={styles.backArrow}
                    onPress={() => {
                        navigation.goBack();
                    }}
                >
                    <Ionicons name="arrow-back-sharp" size={40} color="black" />
                </Pressable>
                <Text style={styles.title}>Edit Receipt</Text>
            </View>
        <ScrollView style={{ borderRadius: 25, margin: 10, marginTop: 0}} showsVerticalScrollIndicator={false}>
            <View style={[styles.postContainer]}>
                <View style={styles.postHeader}>
                {/* Post header */}
                <Image style={styles.userAvatar} source={{ url: postInfo.userAvatar }} />
                <View>
                    <Text style={[{marginLeft: 8, color: '#C5F277', fontSize: 20, fontWeight: 'bold' }]}>
                    {postInfo.username}
                    </Text>
                    <Text style={[{marginLeft: 8, color: '#B17BFF', fontSize: 16}]}>{postInfo.createdAt}</Text>
                </View>
                </View>
                <Text
                style={[
                    {
                    color: "#C5F277",
                    fontSize: 20,
                    marginHorizontal: 13,
                    paddingBottom: 20,
                    height: 35,
                    lineHeight: 35,
                    fontWeight: 'bold'
                    },
                ]}
                numberOfLines={2}
                >
                {postInfo.title}
                </Text>
                <View style={
                    { 
                        marginHorizontal: 5,
                        borderRadius: 10,
                        marginBottom: 50
                    }}>
                    <Text
                        style={[
                        {
                            color: "#C5F277",
                            fontSize: 20,
                            marginHorizontal: 8,
                            lineHeight: 22,
                        },
                        ]}
                    > 
                        {postInfo.description}
                    </Text>
                </View>
                    <View style={styles.likeCommentContainer}>
                        <View style={styles.likeContainer}>
                            <Pressable
                                activeOpacity={0.7}
                                onPress={() => {
                                    likeButton === 'like2' ?
                                    setLikeButton('like1') :
                                    setLikeButton('like2');
                                }}
                            >
                                <AntDesign name={likeButton} size={25} color="#B17BFF" />
                            </Pressable>
                            <Text style={styles.likeCommentNum}>{likesNum}</Text>
                        </View>
                        <View style={styles.commentContainer}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {

                                }}
                            >
                                <AntDesign name="message1" size={25} color="#B17BFF" />
                            </TouchableOpacity>
                            <Text style={styles.likeCommentNum}>{commentsNum}</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Text 
                            style={[styles.likeCommentNum, {fontSize: 15, position: 'absolute', right: 15, bottom: 10 }]}
                            onPress={() => {
                                setOpen(true);
                            }}
                            >Add a comment</Text>
                    </TouchableOpacity>
            </View>
            <View style={[styles.commentsContainer]}>
                <Text style={{color: '#C5F277', margin: 15, fontSize: 20}}>Comments</Text>
                {
                    comments.map((item, index) => (
                        <View style={{flexDirection: 'row', marginHorizontal: 10 }} key={index}>
                            <Image style={styles.userAvatar} source={{ url: item.userPhoto }} />
                            <View style={styles.textsContainer}>
                                <Text style={{color: '#C5F277', fontWeight: 'bold'}}>{item.username}</Text>
                                <Text style={{color: '#B17BFF'}}>15 min ago</Text>
                                <Text style={{color: "#C5F277", marginTop: 10}}>{item.review}</Text>
                                {
                                    (index !== comments.length - 1) &&
                                    <View
                                        style={{
                                            borderBottomColor: '#C5F277',
                                            borderBottomWidth: 0.3,
                                            marginTop: 20
                                        }}
                                    />
                                }
                            </View>
                        </View>
                    ))
                }
            </View>

        </ScrollView>
        {isOpen ? (
          <BottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onClose={() => setOpen(false)}
            backdropComponent={renderBackdrop}
          >
            <BottomSheetView>
              <Comment/>
            </BottomSheetView>
          </BottomSheet>
        ) : null}
        </SafeAreaView>
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
    //   margin: 10,
  
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
      left: 15,
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
    likeCommentNum: {
      fontSize: 20,
      lineHeight: 28,
      color: '#B17BFF',
      marginLeft: 5
    },
    backArrow: {
        // backgroundColor: 'green',
        width: 40,
        margin: 10,
    },
    title: {
        // backgroundColor: 'green',
        fontSize: 32,
        margin: 10,
        marginLeft: 0,
        fontWeight: "bold",
    },
    commentsContainer: {
        borderRadius: 25,
        backgroundColor: 'black', 
        // margin: 10,
        marginTop: 5,
        shadowOffset:{width:0, height:5},  
        shadowColor:'#171717',  
        shadowOpacity:0.2,  
        shadowRadius:2,  
    },
    textsContainer: {
        position: 'relative',
        // backgroundColor: 'yellow',
        flex: 1,
        padding: 10
    }
  });

export default PostDetailScreen;
