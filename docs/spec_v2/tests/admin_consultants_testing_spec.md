# Admin Consultants Testing Specification v2

## Overview

This document defines comprehensive automated testing specifications for the admin consultants management interface at `http://localhost:8041/admin/consultants`. The testing strategy covers API integration tests, frontend component tests, workflow validation, and end-to-end scenarios for the complete consultant management system.

→ **System Under Test**: [Admin Consultants Interface](../frontend/adminpanel/consultant-management.md)
← **API Dependencies**: [Consultant API Endpoints](../backend/consultants.md)
⚡ **Test Infrastructure**: [Backend API Testing Framework](backend/api_testing_spec.md), [Frontend Testing Setup](frontend/component_testing_spec.md)

## Test Categories

### 1. API Integration Tests
Validate all consultant-related API endpoints with comprehensive error handling and security validation.

### 2. Frontend Component Tests
Test React components for consultant management interface including forms, tables, and navigation.

### 3. Workflow Integration Tests
End-to-end testing of consultant lifecycle workflows including signup, profile completion, and management.

### 4. Security & Authorization Tests
Validate role-based access control and data protection for consultant management features.

## API Integration Tests

### Authentication & Authorization Tests

```python
@pytest.mark.asyncio
async def test_admin_consultants_requires_authentication(client: AsyncClient):
    """Test that consultant admin endpoints require authentication"""
    response = await client.get("/admin/consultants")
    assert response.status_code == 401
    assert "authentication" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_admin_consultants_requires_admin_role(
    client: AsyncClient, 
    auth_headers_viewer: dict
):
    """Test that consultant admin endpoints require admin role"""
    response = await client.get("/admin/consultants", headers=auth_headers_viewer)
    assert response.status_code == 403
    assert response.json()["detail"] == "Insufficient permissions"

@pytest.mark.asyncio
async def test_admin_consultants_allows_admin_access(
    client: AsyncClient, 
    auth_headers_admin: dict
):
    """Test that admin users can access consultant management"""
    response = await client.get("/admin/consultants", headers=auth_headers_admin)
    assert response.status_code == 200
    assert "success" in response.json()
    assert "data" in response.json()
```

### Consultant CRUD Operations Tests

```python
@pytest.mark.asyncio
async def test_create_consultant_success(
    client: AsyncClient, 
    auth_headers_admin: dict,
    consultant_factory: ConsultantFactory
):
    """Test successful consultant creation"""
    consultant_data = consultant_factory.create_consultant_data(
        email="new.consultant@example.com",
        first_name="John",
        last_name="Doe",
        linkedin_url="https://linkedin.com/in/johndoe"
    )
    
    response = await client.post(
        "/admin/consultants", 
        json=consultant_data, 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["email"] == "new.consultant@example.com"
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["status"] == "pending"
    assert data["kyc_status"] == "not_started"
    assert "id" in data

@pytest.mark.asyncio
async def test_create_consultant_duplicate_email(
    client: AsyncClient, 
    auth_headers_admin: dict,
    existing_consultant: Consultant
):
    """Test consultant creation with duplicate email fails"""
    consultant_data = {
        "email": existing_consultant.email,
        "first_name": "Duplicate",
        "last_name": "User",
        "linkedin_url": "https://linkedin.com/in/duplicate"
    }
    
    response = await client.post(
        "/admin/consultants", 
        json=consultant_data, 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

@pytest.mark.asyncio
async def test_create_consultant_invalid_email(
    client: AsyncClient, 
    auth_headers_admin: dict
):
    """Test consultant creation with invalid email format"""
    consultant_data = {
        "email": "invalid-email-format",
        "first_name": "Test",
        "last_name": "User",
        "linkedin_url": "https://linkedin.com/in/test"
    }
    
    response = await client.post(
        "/admin/consultants", 
        json=consultant_data, 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any(error["loc"] == ["email"] for error in errors)

@pytest.mark.asyncio
async def test_get_all_consultants_admin(
    client: AsyncClient, 
    auth_headers_admin: dict,
    sample_consultants: List[Consultant]
):
    """Test retrieving all consultants for admin"""
    response = await client.get("/admin/consultants", headers=auth_headers_admin)
    
    assert response.status_code == 200
    data = response.json()["data"]
    assert "consultants" in data
    assert "total" in data
    assert len(data["consultants"]) <= 50  # Default limit
    
    # Verify consultant data structure
    if data["consultants"]:
        consultant = data["consultants"][0]
        required_fields = [
            "id", "email", "first_name", "last_name", "status", 
            "kyc_status", "created_at"
        ]
        for field in required_fields:
            assert field in consultant

@pytest.mark.asyncio
async def test_get_consultant_by_id_admin(
    client: AsyncClient, 
    auth_headers_admin: dict,
    existing_consultant: Consultant
):
    """Test retrieving specific consultant by ID"""
    response = await client.get(
        f"/admin/consultants/{existing_consultant.id}", 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["id"] == existing_consultant.id
    assert data["email"] == existing_consultant.email
    
    # Verify admin-specific fields are included
    admin_fields = [
        "linkedin_url", "linkedin_id", "phone", "ai_summary",
        "total_earnings", "response_rate"
    ]
    for field in admin_fields:
        assert field in data

@pytest.mark.asyncio
async def test_get_nonexistent_consultant(
    client: AsyncClient, 
    auth_headers_admin: dict
):
    """Test retrieving non-existent consultant returns 404"""
    fake_id = str(uuid.uuid4())
    response = await client.get(
        f"/admin/consultants/{fake_id}", 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_update_consultant_success(
    client: AsyncClient, 
    auth_headers_admin: dict,
    existing_consultant: Consultant
):
    """Test successful consultant update"""
    update_data = {
        "first_name": "Updated",
        "headline": "Senior AI Consultant",
        "hourly_rate": 150.0,
        "specializations": ["AI", "Machine Learning", "Data Science"]
    }
    
    response = await client.put(
        f"/admin/consultants/{existing_consultant.id}", 
        json=update_data, 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()["consultant"]
    assert data["first_name"] == "Updated"
    assert data["headline"] == "Senior AI Consultant"
    assert data["hourly_rate"] == 150.0
    assert data["specializations"] == ["AI", "Machine Learning", "Data Science"]

@pytest.mark.asyncio
async def test_update_consultant_invalid_data(
    client: AsyncClient, 
    auth_headers_admin: dict,
    existing_consultant: Consultant
):
    """Test consultant update with invalid data"""
    update_data = {
        "hourly_rate": -50.0,  # Invalid negative rate
        "years_experience": -5  # Invalid negative experience
    }
    
    response = await client.put(
        f"/admin/consultants/{existing_consultant.id}", 
        json=update_data, 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("hourly_rate" in str(error) for error in errors)

@pytest.mark.asyncio
async def test_delete_consultant_success(
    client: AsyncClient, 
    auth_headers_admin: dict,
    deleteable_consultant: Consultant
):
    """Test successful consultant deletion"""
    response = await client.delete(
        f"/admin/consultants/{deleteable_consultant.id}", 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    assert response.json()["success"] == True
    
    # Verify consultant is deleted
    get_response = await client.get(
        f"/admin/consultants/{deleteable_consultant.id}", 
        headers=auth_headers_admin
    )
    assert get_response.status_code == 404
```

### Status Management Tests

```python
@pytest.mark.asyncio
async def test_update_consultant_status_success(
    client: AsyncClient, 
    auth_headers_admin: dict,
    pending_consultant: Consultant
):
    """Test successful consultant status update"""
    status_data = {
        "status": "active",
        "notes": "Profile review completed"
    }
    
    response = await client.patch(
        f"/admin/consultants/{pending_consultant.id}/status", 
        json=status_data, 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["old_status"] == "pending"
    assert data["new_status"] == "active"

@pytest.mark.asyncio
async def test_update_consultant_invalid_status(
    client: AsyncClient, 
    auth_headers_admin: dict,
    existing_consultant: Consultant
):
    """Test consultant status update with invalid status"""
    status_data = {"status": "invalid_status"}
    
    response = await client.patch(
        f"/admin/consultants/{existing_consultant.id}/status", 
        json=status_data, 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 400
    assert "Invalid status" in response.json()["detail"]

@pytest.mark.asyncio
async def test_consultant_status_workflow(
    client: AsyncClient, 
    auth_headers_admin: dict,
    pending_consultant: Consultant
):
    """Test complete consultant status workflow"""
    # Test status progression: pending -> kyc_review -> active
    statuses = ["kyc_review", "active"]
    previous_status = "pending"
    
    for status in statuses:
        response = await client.patch(
            f"/admin/consultants/{pending_consultant.id}/status",
            json={"status": status, "notes": f"Moving to {status}"},
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["old_status"] == previous_status
        assert data["new_status"] == status
        previous_status = status
```

### Search and Filtering Tests

```python
@pytest.mark.asyncio
async def test_search_consultants_by_name(
    client: AsyncClient, 
    auth_headers_admin: dict,
    named_consultant: Consultant
):
    """Test searching consultants by name"""
    response = await client.get(
        f"/admin/consultants?q={named_consultant.first_name}", 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total"] > 0
    
    # Verify search result contains the named consultant
    consultant_ids = [c["id"] for c in data["consultants"]]
    assert named_consultant.id in consultant_ids

@pytest.mark.asyncio
async def test_filter_consultants_by_status(
    client: AsyncClient, 
    auth_headers_admin: dict,
    active_consultant: Consultant,
    pending_consultant: Consultant
):
    """Test filtering consultants by status"""
    response = await client.get(
        "/admin/consultants?status=active", 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()["data"]
    
    # All returned consultants should have 'active' status
    for consultant in data["consultants"]:
        assert consultant["status"] == "active"

@pytest.mark.asyncio
async def test_filter_consultants_by_industry(
    client: AsyncClient, 
    auth_headers_admin: dict,
    tech_consultant: Consultant
):
    """Test filtering consultants by industry"""
    response = await client.get(
        f"/admin/consultants?industry={tech_consultant.industry}", 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()["data"]
    
    # All returned consultants should match the industry filter
    for consultant in data["consultants"]:
        assert consultant["industry"] == tech_consultant.industry

@pytest.mark.asyncio
async def test_consultant_pagination(
    client: AsyncClient, 
    auth_headers_admin: dict,
    many_consultants: List[Consultant]
):
    """Test consultant list pagination"""
    # Test first page
    response = await client.get(
        "/admin/consultants?limit=10&offset=0", 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data["consultants"]) <= 10
    assert data["limit"] == 10
    assert data["offset"] == 0
    
    # Test second page
    if data["total"] > 10:
        response = await client.get(
            "/admin/consultants?limit=10&offset=10", 
            headers=auth_headers_admin
        )
        
        assert response.status_code == 200
        second_page = response.json()["data"]
        assert len(second_page["consultants"]) <= 10
        assert second_page["offset"] == 10
        
        # Verify different results
        first_page_ids = {c["id"] for c in data["consultants"]}
        second_page_ids = {c["id"] for c in second_page["consultants"]}
        assert first_page_ids.isdisjoint(second_page_ids)
```

### AI Profile Generation Tests

```python
@pytest.mark.asyncio
async def test_generate_ai_profile_success(
    client: AsyncClient, 
    auth_headers_admin: dict,
    consultant_with_linkedin_data: Consultant
):
    """Test successful AI profile generation"""
    response = await client.post(
        f"/admin/consultants/{consultant_with_linkedin_data.id}/generate-ai-profile",
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    
    if "ai_content" in data:
        ai_content = data["ai_content"]
        assert "summary" in ai_content
        assert "skills_assessment" in ai_content
        assert "market_positioning" in ai_content
        assert "keywords" in ai_content

@pytest.mark.asyncio
async def test_generate_ai_profile_force_regenerate(
    client: AsyncClient, 
    auth_headers_admin: dict,
    consultant_with_ai_profile: Consultant
):
    """Test forcing AI profile regeneration"""
    response = await client.post(
        f"/admin/consultants/{consultant_with_ai_profile.id}/generate-ai-profile?force_regenerate=true",
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "ai_content" in data

@pytest.mark.asyncio
async def test_generate_ai_profile_nonexistent_consultant(
    client: AsyncClient, 
    auth_headers_admin: dict
):
    """Test AI profile generation for non-existent consultant"""
    fake_id = str(uuid.uuid4())
    response = await client.post(
        f"/admin/consultants/{fake_id}/generate-ai-profile",
        headers=auth_headers_admin
    )
    
    assert response.status_code == 400
    assert "not found" in response.json()["detail"].lower()
```

### Statistics and Analytics Tests

```python
@pytest.mark.asyncio
async def test_get_consultant_statistics(
    client: AsyncClient, 
    auth_headers_admin: dict,
    consultants_with_projects: List[Consultant]
):
    """Test retrieving consultant platform statistics"""
    response = await client.get(
        "/admin/statistics", 
        headers=auth_headers_admin
    )
    
    assert response.status_code == 200
    data = response.json()["data"]
    
    # Verify required statistics fields
    required_stats = [
        "total_consultants", "active_consultants", "pending_consultants",
        "kyc_pending", "kyc_approved", "total_projects", "completed_projects",
        "completion_rate", "total_earnings", "platform_revenue"
    ]
    
    for stat in required_stats:
        assert stat in data
        assert isinstance(data[stat], (int, float))
    
    # Verify industry breakdown
    assert "industry_breakdown" in data
    assert isinstance(data["industry_breakdown"], list)

@pytest.mark.asyncio
async def test_statistics_performance(
    client: AsyncClient, 
    auth_headers_admin: dict
):
    """Test statistics endpoint performance"""
    import time
    
    start_time = time.time()
    response = await client.get(
        "/admin/statistics", 
        headers=auth_headers_admin
    )
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 2.0  # Should respond within 2 seconds
```

## Frontend Component Tests

### Consultant List Component Tests

```typescript
describe('ConsultantList Component', () => {
  beforeEach(() => {
    mockConsultantData = createMockConsultants(10);
  });

  test('renders consultant list with data', async () => {
    render(<ConsultantList consultants={mockConsultantData} />);
    
    expect(screen.getByText('Consultants')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(11); // 10 data + 1 header
  });

  test('displays consultant information correctly', async () => {
    const consultant = mockConsultantData[0];
    render(<ConsultantList consultants={[consultant]} />);
    
    expect(screen.getByText(consultant.full_name)).toBeInTheDocument();
    expect(screen.getByText(consultant.email)).toBeInTheDocument();
    expect(screen.getByText(consultant.status)).toBeInTheDocument();
  });

  test('filters consultants by status', async () => {
    render(<ConsultantList consultants={mockConsultantData} />);
    
    const statusFilter = screen.getByLabelText('Filter by Status');
    await userEvent.selectOptions(statusFilter, 'active');
    
    // Should only show active consultants
    const visibleRows = screen.getAllByRole('row').slice(1); // Exclude header
    visibleRows.forEach(row => {
      expect(row).toHaveTextContent('active');
    });
  });

  test('searches consultants by name', async () => {
    const searchTerm = mockConsultantData[0].first_name;
    render(<ConsultantList consultants={mockConsultantData} />);
    
    const searchInput = screen.getByPlaceholderText('Search consultants...');
    await userEvent.type(searchInput, searchTerm);
    
    expect(screen.getByText(mockConsultantData[0].full_name)).toBeInTheDocument();
  });

  test('handles bulk operations', async () => {
    const onBulkStatusUpdate = jest.fn();
    render(
      <ConsultantList 
        consultants={mockConsultantData} 
        onBulkStatusUpdate={onBulkStatusUpdate}
      />
    );
    
    // Select multiple consultants
    const checkboxes = screen.getAllByRole('checkbox').slice(1); // Exclude select all
    await userEvent.click(checkboxes[0]);
    await userEvent.click(checkboxes[1]);
    
    // Trigger bulk action
    const bulkActionButton = screen.getByText('Bulk Actions');
    await userEvent.click(bulkActionButton);
    
    const updateStatusOption = screen.getByText('Update Status');
    await userEvent.click(updateStatusOption);
    
    expect(onBulkStatusUpdate).toHaveBeenCalled();
  });

  test('sorts consultants by column', async () => {
    render(<ConsultantList consultants={mockConsultantData} />);
    
    const nameHeader = screen.getByText('Name');
    await userEvent.click(nameHeader);
    
    // Verify sorting indicator appears
    expect(screen.getByTestId('sort-indicator')).toBeInTheDocument();
  });
});
```

### Consultant Form Component Tests

```typescript
describe('ConsultantForm Component', () => {
  test('creates new consultant with valid data', async () => {
    const onSubmit = jest.fn();
    render(<ConsultantForm onSubmit={onSubmit} />);
    
    // Fill form fields
    await userEvent.type(screen.getByLabelText('First Name'), 'John');
    await userEvent.type(screen.getByLabelText('Last Name'), 'Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
    await userEvent.type(screen.getByLabelText('LinkedIn URL'), 'https://linkedin.com/in/johndoe');
    
    // Submit form
    await userEvent.click(screen.getByText('Create Consultant'));
    
    expect(onSubmit).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      linkedin_url: 'https://linkedin.com/in/johndoe'
    });
  });

  test('validates required fields', async () => {
    render(<ConsultantForm onSubmit={jest.fn()} />);
    
    // Try to submit empty form
    await userEvent.click(screen.getByText('Create Consultant'));
    
    // Should show validation errors
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  test('validates email format', async () => {
    render(<ConsultantForm onSubmit={jest.fn()} />);
    
    await userEvent.type(screen.getByLabelText('Email'), 'invalid-email');
    await userEvent.tab(); // Trigger validation
    
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  test('updates existing consultant', async () => {
    const existingConsultant = createMockConsultant();
    const onSubmit = jest.fn();
    
    render(<ConsultantForm consultant={existingConsultant} onSubmit={onSubmit} />);
    
    // Form should be pre-filled
    expect(screen.getByDisplayValue(existingConsultant.first_name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(existingConsultant.last_name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(existingConsultant.email)).toBeInTheDocument();
    
    // Update a field
    const firstNameInput = screen.getByLabelText('First Name');
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Updated');
    
    await userEvent.click(screen.getByText('Update Consultant'));
    
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Updated'
      })
    );
  });
});
```

### Status Management Component Tests

```typescript
describe('ConsultantStatusManager Component', () => {
  test('updates consultant status', async () => {
    const consultant = createMockConsultant({ status: 'pending' });
    const onStatusUpdate = jest.fn();
    
    render(
      <ConsultantStatusManager 
        consultant={consultant} 
        onStatusUpdate={onStatusUpdate} 
      />
    );
    
    // Open status dropdown
    await userEvent.click(screen.getByText('pending'));
    
    // Select new status
    await userEvent.click(screen.getByText('active'));
    
    // Should show confirmation dialog
    expect(screen.getByText('Confirm Status Change')).toBeInTheDocument();
    
    // Confirm change
    await userEvent.click(screen.getByText('Confirm'));
    
    expect(onStatusUpdate).toHaveBeenCalledWith(consultant.id, 'active');
  });

  test('shows status change notes field', async () => {
    const consultant = createMockConsultant({ status: 'pending' });
    
    render(<ConsultantStatusManager consultant={consultant} />);
    
    await userEvent.click(screen.getByText('pending'));
    await userEvent.click(screen.getByText('active'));
    
    // Notes field should be visible in confirmation dialog
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
  });

  test('handles status update errors', async () => {
    const consultant = createMockConsultant({ status: 'pending' });
    const onStatusUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));
    
    render(
      <ConsultantStatusManager 
        consultant={consultant} 
        onStatusUpdate={onStatusUpdate} 
      />
    );
    
    await userEvent.click(screen.getByText('pending'));
    await userEvent.click(screen.getByText('active'));
    await userEvent.click(screen.getByText('Confirm'));
    
    // Should show error message
    expect(await screen.findByText('Failed to update status')).toBeInTheDocument();
  });
});
```

## End-to-End Workflow Tests

### Complete Consultant Lifecycle Test

```python
@pytest.mark.e2e
async def test_complete_consultant_lifecycle(
    client: AsyncClient, 
    auth_headers_admin: dict,
    consultant_factory: ConsultantFactory
):
    """Test complete consultant management lifecycle"""
    
    # 1. Create new consultant
    consultant_data = consultant_factory.create_consultant_data()
    create_response = await client.post(
        "/admin/consultants", 
        json=consultant_data, 
        headers=auth_headers_admin
    )
    assert create_response.status_code == 201
    consultant_id = create_response.json()["data"]["id"]
    
    # 2. Update consultant profile
    update_data = {
        "headline": "AI/ML Consultant",
        "specializations": ["Artificial Intelligence", "Machine Learning"],
        "hourly_rate": 200.0
    }
    update_response = await client.put(
        f"/admin/consultants/{consultant_id}", 
        json=update_data, 
        headers=auth_headers_admin
    )
    assert update_response.status_code == 200
    
    # 3. Update status through workflow
    status_updates = ["kyc_review", "active"]
    for status in status_updates:
        status_response = await client.patch(
            f"/admin/consultants/{consultant_id}/status",
            json={"status": status, "notes": f"Updated to {status}"},
            headers=auth_headers_admin
        )
        assert status_response.status_code == 200
    
    # 4. Generate AI profile
    ai_response = await client.post(
        f"/admin/consultants/{consultant_id}/generate-ai-profile",
        headers=auth_headers_admin
    )
    assert ai_response.status_code == 200
    
    # 5. Verify final state
    final_response = await client.get(
        f"/admin/consultants/{consultant_id}", 
        headers=auth_headers_admin
    )
    assert final_response.status_code == 200
    final_data = final_response.json()["data"]
    assert final_data["status"] == "active"
    assert final_data["headline"] == "AI/ML Consultant"
    assert final_data["hourly_rate"] == 200.0

@pytest.mark.e2e
async def test_bulk_consultant_operations(
    client: AsyncClient, 
    auth_headers_admin: dict,
    multiple_consultants: List[Consultant]
):
    """Test bulk operations on multiple consultants"""
    
    consultant_ids = [c.id for c in multiple_consultants[:3]]
    
    # Test bulk status update through individual calls
    # (Since bulk endpoint might not exist yet, test individual updates)
    for consultant_id in consultant_ids:
        response = await client.patch(
            f"/admin/consultants/{consultant_id}/status",
            json={"status": "active", "notes": "Bulk activation"},
            headers=auth_headers_admin
        )
        assert response.status_code == 200
    
    # Verify all consultants are now active
    for consultant_id in consultant_ids:
        response = await client.get(
            f"/admin/consultants/{consultant_id}", 
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        assert response.json()["data"]["status"] == "active"
```

### Error Handling and Edge Cases

```python
@pytest.mark.asyncio
async def test_consultant_operations_with_invalid_ids(
    client: AsyncClient, 
    auth_headers_admin: dict
):
    """Test consultant operations with malformed or invalid IDs"""
    
    invalid_ids = [
        "not-a-uuid",
        "12345",
        "",
        "null",
        str(uuid.uuid4())  # Valid format but non-existent
    ]
    
    for invalid_id in invalid_ids:
        # Test GET
        get_response = await client.get(
            f"/admin/consultants/{invalid_id}", 
            headers=auth_headers_admin
        )
        assert get_response.status_code in [400, 404, 422]
        
        # Test PUT
        put_response = await client.put(
            f"/admin/consultants/{invalid_id}", 
            json={"first_name": "Test"}, 
            headers=auth_headers_admin
        )
        assert put_response.status_code in [400, 404, 422]
        
        # Test DELETE
        delete_response = await client.delete(
            f"/admin/consultants/{invalid_id}", 
            headers=auth_headers_admin
        )
        assert delete_response.status_code in [400, 404, 422]

@pytest.mark.asyncio
async def test_consultant_operations_concurrent_access(
    client: AsyncClient, 
    auth_headers_admin: dict,
    existing_consultant: Consultant
):
    """Test concurrent access to consultant operations"""
    
    # Simulate concurrent updates
    tasks = []
    for i in range(5):
        task = client.put(
            f"/admin/consultants/{existing_consultant.id}",
            json={"headline": f"Updated Headline {i}"},
            headers=auth_headers_admin
        )
        tasks.append(task)
    
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    # At least one should succeed
    successful_responses = [
        r for r in responses 
        if not isinstance(r, Exception) and r.status_code == 200
    ]
    assert len(successful_responses) >= 1
```

## Performance and Load Tests

```python
@pytest.mark.performance
async def test_consultant_list_performance(
    client: AsyncClient, 
    auth_headers_admin: dict,
    large_consultant_dataset: List[Consultant]
):
    """Test consultant list performance with large dataset"""
    import time
    
    start_time = time.time()
    response = await client.get(
        "/admin/consultants?limit=100", 
        headers=auth_headers_admin
    )
    end_time = time.time()
    
    assert response.status_code == 200
    assert (end_time - start_time) < 3.0  # Should complete within 3 seconds
    
    data = response.json()["data"]
    assert len(data["consultants"]) <= 100

@pytest.mark.performance
async def test_concurrent_consultant_requests(
    client: AsyncClient, 
    auth_headers_admin: dict,
    sample_consultants: List[Consultant]
):
    """Test concurrent consultant requests"""
    
    # Create 20 concurrent requests
    tasks = []
    for i in range(20):
        task = client.get("/admin/consultants", headers=auth_headers_admin)
        tasks.append(task)
    
    start_time = time.time()
    responses = await asyncio.gather(*tasks)
    end_time = time.time()
    
    # All requests should succeed
    for response in responses:
        assert response.status_code == 200
    
    # Total time should be reasonable
    assert (end_time - start_time) < 10.0
```

## Test Fixtures and Utilities

### Consultant Factory

```python
class ConsultantFactory:
    @staticmethod
    def create_consultant_data(**overrides) -> Dict[str, Any]:
        """Create consultant data for API requests"""
        base_data = {
            "email": f"consultant{uuid.uuid4().hex[:8]}@example.com",
            "first_name": "Test",
            "last_name": "Consultant",
            "linkedin_url": f"https://linkedin.com/in/test{uuid.uuid4().hex[:8]}",
            "headline": "Professional Consultant",
            "location": "Remote",
            "industry": "Technology",
            "specializations": ["Strategy", "Digital Transformation"],
            "years_experience": 5,
            "hourly_rate": 150.0,
            "currency": "EUR",
            "languages_spoken": ["English", "German"]
        }
        base_data.update(overrides)
        return base_data

@pytest_asyncio.fixture
async def consultant_factory() -> ConsultantFactory:
    return ConsultantFactory()

@pytest_asyncio.fixture
async def existing_consultant(db: AsyncSession) -> Consultant:
    """Create a consultant for testing"""
    consultant_data = ConsultantFactory.create_consultant_data()
    service = ConsultantService(db)
    result = await service.create_consultant(consultant_data)
    return result["consultant"]

@pytest_asyncio.fixture
async def multiple_consultants(db: AsyncSession) -> List[Consultant]:
    """Create multiple consultants for testing"""
    consultants = []
    service = ConsultantService(db)
    
    for i in range(10):
        consultant_data = ConsultantFactory.create_consultant_data(
            first_name=f"Consultant{i}",
            industry="Technology" if i % 2 == 0 else "Finance"
        )
        result = await service.create_consultant(consultant_data)
        consultants.append(result["consultant"])
    
    return consultants
```

### Mock Data Utilities

```typescript
// Frontend test utilities
export const createMockConsultant = (overrides = {}) => ({
  id: 'test-id-123',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'Consultant',
  full_name: 'Test Consultant',
  status: 'active',
  kyc_status: 'approved',
  industry: 'Technology',
  hourly_rate: 150.0,
  specializations: ['Strategy', 'AI'],
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
});

export const createMockConsultants = (count: number) => 
  Array.from({ length: count }, (_, i) => createMockConsultant({
    id: `test-id-${i}`,
    first_name: `Consultant${i}`,
    email: `consultant${i}@example.com`
  }));
```

## Quality Standards and Coverage Requirements

### Coverage Requirements
- **API Endpoints**: 100% endpoint coverage for all consultant management routes
- **Error Scenarios**: All possible error paths tested (400, 401, 403, 404, 409, 422, 500)
- **Business Logic**: 95%+ coverage for consultant service methods
- **Frontend Components**: 90%+ coverage for React components
- **Integration Flows**: Complete workflow coverage for consultant lifecycle

### Performance Standards
- **API Response Time**: <2 seconds for CRUD operations, <5 seconds for complex searches
- **Frontend Loading**: <1 second for component rendering, <3 seconds for data loading
- **Concurrent Requests**: Handle 50+ concurrent consultant API requests
- **Database Queries**: Optimized queries with appropriate indexing

### Test Execution Examples

```bash
# Run all consultant tests
pytest tests/ -k "consultant" -v

# Run specific test categories
pytest tests/ -m "consultant and api" -v
pytest tests/ -m "consultant and e2e" -v
pytest tests/ -m "consultant and performance" --durations=0

# Run with coverage
pytest tests/admin/consultants/ --cov=app.api.v1.consultants --cov=app.services.consultant_service --cov-report=html

# Run frontend tests
npm test -- --testPathPattern=consultants

# Run E2E tests
pytest tests/e2e/consultant_workflows.py -v
```

This specification ensures comprehensive testing coverage for the admin consultants management interface, validating all functionality from basic CRUD operations to complex workflow integrations while maintaining high performance and security standards.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Explore codebase structure and existing test specifications", "status": "completed", "activeForm": "Exploring codebase structure and existing test specifications"}, {"content": "Examine the admin consultants page functionality", "status": "completed", "activeForm": "Examining the admin consultants page functionality"}, {"content": "Review existing spec v2 format and structure", "status": "completed", "activeForm": "Reviewing existing spec v2 format and structure"}, {"content": "Write comprehensive automated test specification v2", "status": "completed", "activeForm": "Writing comprehensive automated test specification v2"}]