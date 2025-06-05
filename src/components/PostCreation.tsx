"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Avatar } from './ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { Textarea } from './ui/textarea'
import { ImageIcon, Loader2Icon, SendIcon } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useState } from "react"
import { createPost } from "@/actions/post.action"
import toast from "react-hot-toast"
import UploadImage from "./UploadImage"

import { useRouter } from 'next/navigation'; 

const PostCreation = () => {

  const router = useRouter()


  //getting user from dbuserId
  const {user} = useUser()
  const [postContent, setpostContent] = useState("")
  const [postImageUrl, setpostImageUrl] = useState("")
  const [isPosting, setisPosting] = useState(false)
  const [showImageUpload, setshowImageUpload] = useState(false)


  const handlePost = async () => {
      if (!postContent.trim() && !postImageUrl) return;
      try {
          setisPosting(true)
          //a method call to the createpost in backend
          const newPost = await createPost(postContent, postImageUrl)
          if(newPost?.success){
            setpostContent("")
            setpostImageUrl("")
            toast.success("Post Created")
            router.refresh() //refresh the page after successfully posting the image
          }
      } catch (error: any) {
        console.log("Error Creating Post", error.message)
        toast.error("Error in Post Creation")
      } finally {
        setisPosting(false)
      }
  }


  return (
    <div>
      <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.imageUrl || "/avatar.png"} />
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
              value={postContent}
              onChange={(e) => setpostContent(e.target.value)}
              disabled={isPosting}
            />
          </div>

          
            {(showImageUpload || postImageUrl) && (
            <div className="border rounded-lg p-4">
              <UploadImage
                endPoints="postImage"
                value={postImageUrl}
                onChange={(url) => {
                  setpostImageUrl(url);
                  if (!url) setshowImageUpload(false);
                }}
              />
            </div>
          )}
        

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setshowImageUpload(!showImageUpload)}
              >
                <ImageIcon className="size-4 mr-2" />
                Photo
              </Button>
            </div>
            <Button
              className="flex items-center neue-roman"
              disabled={isPosting || (!postContent.trim() && !postImageUrl)}
              onClick={handlePost}
            >
              {
                isPosting ? (
                  <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...</>
                ) : (
                  <>
                  <SendIcon className="size-4 mr-2" />
                  Post</>
                )
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

export default PostCreation