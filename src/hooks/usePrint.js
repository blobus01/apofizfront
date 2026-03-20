import {useCallback} from 'react'
import ReactDOMServer from 'react-dom/server'
import {useHistory} from 'react-router-dom'

const PRINT_PAGE = '/print'

const usePrint = () => {
	const history = useHistory()

	return useCallback(
		/**
		 * @param {React.ReactElement} content
		 */
		content => {
			const html = ReactDOMServer.renderToString(content)

			history.push(PRINT_PAGE, {html})
		}, [history])
}

export default usePrint