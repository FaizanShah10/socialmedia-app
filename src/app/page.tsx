import React from 'react'


import PostCreation from '@/components/PostCreation'
import SuggestedUser from '@/components/SuggestedUser'
import PostCard from '@/components/PostCard'
import { getPosts } from '@/actions/post.action'
import { getDbUserId } from '@/actions/user.action'
import { PostWithDetails } from '@/types'

const HomePage = async () => {


  const posts = await getPosts()
  const dbUserId = await getDbUserId()

  if(!posts) return null

  return (
    <div className='grid lg:grid-cols-12 gap-4'>
      <div className='col-span-8'>
        {/* Post Creation */}
        <PostCreation/>
        {
          posts.map((post: PostWithDetails) => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId}/>
          ))
        }
      </div>  
      <div className='col-span-4'>
        <SuggestedUser/>
        
      </div>

    </div>
  )
}

export default HomePage