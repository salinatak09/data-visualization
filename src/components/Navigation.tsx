import { Link } from 'react-router'

const Navigation = () => {
  return (
    <div style={{margin: '20px', display: 'flex', gap: 20}}>
      <Link to={"/"}>Home</Link>
      <Link to={"/visualize"}>Data Visualization</Link>
    </div>
  )
}

export default Navigation