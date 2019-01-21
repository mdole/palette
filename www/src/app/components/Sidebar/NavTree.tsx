import { Box, Sans, SansSize } from "@artsy/palette"
import { StatusBadge } from "app/components/StatusBadge"
import { pathListToTree, TreeNode } from "app/utils/pathListToTree"
import { graphql, Link, StaticQuery } from "gatsby"
import { get, includes } from "lodash"
import React, { Fragment } from "react"

// TODO: Add `showInNav` frontmatter
const NAV_BLACKLIST = ["dev-404-page", "404", "404.html"]

export const NavTree = _props => {
  return (
    <StaticQuery
      query={graphql`
        query NavTreeQuery {
          allMdx {
            edges {
              node {
                fields {
                  route
                }
                frontmatter {
                  name
                  wip
                }
              }
            }
          }
        }
      `}
      render={data => {
        return renderNavTree(buildNavTree(data))
      }}
    />
  )
}

function renderNavTree(tree: TreeNode[], treeDepth: number = 0) {
  const getTreeLayout = () => {
    switch (treeDepth) {
      case 1: {
        return {
          ml: 2,
          py: 0.3,
          size: "2" as SansSize,
        }
      }
      default: {
        return {
          ml: 0,
          py: 0.2,
          size: "3" as SansSize,
        }
      }
    }
  }

  const { ml, py, size } = getTreeLayout()

  return (
    <Box ml={ml}>
      {tree.map(({ data, children, formattedName, path }: TreeNode) => {
        const isWIP = get(data, "wip", false)
        const hasChildren = Boolean(children.length)

        // const navItems = ["Elements", "Flex", "Slider"]

        // if (!navItems.some(item => item === formattedName)) {
        //   return null
        // }
        if (hasChildren) {
          treeDepth++
        }

        // prettier-ignore
        const label = hasChildren
          ? formattedName
          : <Link to={path}>{formattedName}</Link>

        return (
          <Fragment key={path}>
            <Sans size={size} py={py}>
              {label} {isWIP && !hasChildren && <StatusBadge status="WIP" />}
            </Sans>

            {hasChildren && renderNavTree(children, treeDepth)}
          </Fragment>
        )
      })}
    </Box>
  )
}

function buildNavTree(data) {
  const routes = data.allMdx.edges.reduce((acc, { node }) => {
    const route = node.fields.route.replace(/\/$/, "") // remove trailing slash
    if (route.length) {
      return [
        ...acc,
        {
          path: route,
          data: node.frontmatter,
        },
      ]
    } else {
      return acc
    }
  }, [])

  const navTree = pathListToTree(routes)
    .map(path => path.children)[0]
    .filter(path => !includes(NAV_BLACKLIST, path.name))

  return navTree
}