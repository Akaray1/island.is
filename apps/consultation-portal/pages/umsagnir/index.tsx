import initApollo from '../../graphql/client'
import { ADVICES_GET_ALL_USER_ADVICES } from '../../graphql/queries.graphql'
import { AdvicesGetAllUserAdvicesQuery } from '../../graphql/queries.graphql.generated'
import { UserAdvice } from '../../types/interfaces'
import Advices from '../../screens/Advices/Advices'

interface UserAdvicesProps {
  allUserAdvices: UserAdvice
  isNotAuthorized: boolean
}

export const getServerSideProps = async (ctx) => {
  const input = {
    oldestFirst: false,
    pageNumber: 1,
    pageSize: 20,
    searchQuery: '',
  }

  const client = initApollo()
  try {
    const [
      {
        data: { consultationPortalAllUserAdvices },
      },
    ] = await Promise.all([
      client.query<AdvicesGetAllUserAdvicesQuery>({
        query: ADVICES_GET_ALL_USER_ADVICES,
        variables: { input },
      }),
    ])
    return {
      props: {
        allUserAdvices: consultationPortalAllUserAdvices,
        isNotAuthorized: false,
      },
    }
  } catch (e) {
    console.error(e)
    if (e.message === 'Unauthorized') {
      return {
        props: {
          allUserAdvices: {},
          isNotAuthorized: true,
        },
      }
    }
  }
  return {
    redirect: {
      destination: '/500',
    },
  }
}

export const Index = ({
  allUserAdvices,
  isNotAuthorized,
}: UserAdvicesProps) => {
  return (
    <Advices
      allUserAdvices={allUserAdvices}
      isNotAuthorized={isNotAuthorized}
    />
  )
}

export default Index
