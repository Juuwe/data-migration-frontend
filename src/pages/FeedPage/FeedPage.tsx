import { useEffect, useState, type FC } from 'react'
import { Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { FeedItem } from '../../components/FeedItem/FeedItem'
import { getFeedMethod } from '../../modules/methodsApi'
import type { FeedResponse } from '../../modules/types'
import { ROUTES } from '../../Routes'
import './FeedPage.css'

interface FeedState {
  id?: string
  response: FeedResponse | null
}

export const FeedPage: FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [feed, setFeed] = useState<FeedState>()

  useEffect(() => {
    getFeedMethod(id ? Number(id) : undefined).then((response) => setFeed({ id, response }))
  }, [id])

  const handleNext = (currentId: number) => {
    getFeedMethod(currentId, true).then((response) => {
      if (response) navigate(`${ROUTES.FEED}/${response.method.id}`)
    })
  }

  // Пока данные для текущего id не пришли, показываем загрузку
  if (!feed || feed.id !== id) {
    return (
      <div className="feed-message">
        <Spinner animation="border" variant="light" />
      </div>
    )
  }

  if (!feed.response) {
    return <p className="feed-message">Услуга не найдена</p>
  }

  const { method } = feed.response
  return <FeedItem key={method.id} method={method} onNext={() => handleNext(method.id)} />
}
