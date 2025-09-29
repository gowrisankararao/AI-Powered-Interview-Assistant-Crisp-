import React from 'react'
import { Table, Input, Space, Button } from 'antd'
import { useSelector } from 'react-redux'

export default function Interviewer(){
  const candidates = useSelector(s=>s.candidates.list)
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Score', dataIndex: 'score', key: 'score', render: s=>s ?? '—' },
    { title: 'Summary', dataIndex: 'summary', key: 'summary', render: t=>t ?? '—' }
  ]
  return (
    <div>
      <Space className="mb-4">
        <Input placeholder="Search by name or email" />
        <Button>Search</Button>
      </Space>
      <Table dataSource={candidates} columns={columns} rowKey="id" />
    </div>
  )
}
